import { ref } from "vue";
import axios, { Axios } from "axios";
import { rgb, hex } from "color-convert";

const default_vars = {
  "colors": ['#66bdff', '#ffb142'],
  "status": false,
  "transparency_change": true,
  "ip_addr": '127.0.0.1:1028'
};

declare global {
  interface Window {
    axios_instance: Axios;
    marked: boolean;
    panel: string;
  }
}

interface wordInfo{
  'frequency': number,
  'familiarity': number,
  'sentences': string[],
  'last_used_date': string,
  'notes': string[]
}

async function load_sets(){
  const colors = ref(default_vars.colors);
  const status = ref(default_vars.status)
  const transparency_change = ref(default_vars.transparency_change);
  const ip_addr = ref(default_vars.ip_addr);
  const res = await browser.storage.local.get(default_vars);
  colors.value = res['colors'];
  status.value = res['status'];
  transparency_change.value = res['transparency_change'];
  ip_addr.value = res['ip_addr'];
  console.log('Settings loaded.', res);
  return {colors, status, transparency_change, ip_addr};
}

function gradientColors(colors: string[], transparency_change: boolean, step: number): [number, number, number, number]{
  const start = hex.rgb(colors[0]), end = hex.rgb(colors[1]);
  return [Math.round(start[0] + (end[0] - start[0]) * step * 1.18),
          Math.round(start[1] + (end[1] - start[1]) * step * 1.18),
          Math.round(start[2] + (end[2] - start[2]) * step * 1.18),
          transparency_change ? (1 - (step*0.8)) : 0.8];
}

async function start(){
  let settings = await load_sets();

  window.axios_instance = axios.create({
    baseURL: "http://" + settings.ip_addr.value
  });

  console.log("Testing connection...");
  if ((await FurPost('test', '')) == 'FurLang!'){
    console.log("Connected!");
  }else{
    console.log("Not connected!");
    return;
  }

  console.log("Marking...");
  const gs = Date.now();
  const tags = get_tags();
  console.log("Got tags in ", Date.now() - gs);

  const ms = Date.now();
  for (let i = 0; i < tags.length; i++){
    // if (tags[i].style.backgroundColor != 'transparent'){
    //   continue;
    // }
    mark(tags[i], settings.colors.value, settings.transparency_change.value);
  }
  window.marked = true;
  console.log("Marked in ", Date.now() - ms);
}

async function mark(tag:HTMLElement, colors: string[], transparency_change: boolean){
  const words = await FurPost('get', tag.innerText) as [[string, wordInfo]];
  for (let i = 0; i < words.length; i++){
    console.log("Marking: ", words[i]);
    highlight(tag, words[i], colors, transparency_change);
  }
}

function highlight(tag: HTMLElement, val: [string, wordInfo], colors: string[],transparency_change: boolean){
  // Highlight by modifying the innerHTML
  let htmls = tag.innerText;
  let txt = val[0];
  let re = new RegExp(txt, 'g');
  let newHtml = htmls.replace(re,
    `<mark class="FurMark" style="
    background-color: rgba(${gradientColors(colors, transparency_change, val[1].familiarity)});
    position: relative
    ">${txt}</mark>`);
  tag.innerHTML = newHtml;
  // console.log(newHtml);
  insert_panel(tag, val);
}

function insert_panel(element: HTMLElement, info: [string, wordInfo]){
  const panel = document.createElement('iframe');
  panel.src = window.panel;
  panel.style.position = 'absolute';
  panel.style.top = '1.5em';
  panel.style.left = '5em';
  element.appendChild(panel);
  // panel.onload = () => panel.contentWindow?.setup(info, "");

  element.addEventListener("mouseover", function(){
    // panel.contentWindow?.show();
  });
}

function _get_tags(element:HTMLElement, res: HTMLElement[]){
  const childNodes = element.childNodes;
  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i] as HTMLElement;
    // console.log(child);
    if (fliter_ele(child)){
      res.push(child);
    } else {
      res = _get_tags(child, res);
    }
  }
  return res;
}

function DeepEle(element: HTMLElement){
  // Determines if the element depth is greater than 2
  if (element.childElementCount > 5) return true;
  for (let i = 0; i < element.childElementCount; i++) {
    const child = element.children[i];
    if (child.childElementCount > 0){
      return true;
    }
  }
  return false;
}

function includeCode(element: HTMLElement){
  for (let i = 0; i < element.childElementCount; i++) {
    const child = element.children[i];
    if (child.tagName == 'CODE'){
      return true;
    }
  }
  return false;
}

const text_tags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span'];
const special_tags = ['a', 'div', 'li'];
function fliter_ele(element: HTMLElement): boolean{
  // HTML codes are very complex, so this simple function can not filter them perfectly.
  if(!element.tagName) return false;
  let tag_name = element.tagName.toLowerCase();

  if (text_tags.includes(tag_name)){
    if (element.innerText.length < 5) return false;
    return true;
  }
  if (special_tags.includes(tag_name)){
    // if (!element.textContent) return false;
    if (element.innerText.length < 5) return false;
    if (DeepEle(element)) return false;
    if (includeCode(element)) return false;
    return true;
  }
  return false;
}

function get_tags(){
  // TODO: We may should try filtering algorithms like jusText.
  return _get_tags(document.body, []);
}

async function FurPost(type: string, data: any){
  try{
    const msg = {type, data};
    const res = (await window.axios_instance.post("", msg)).data;
    return res;
  }catch(e){
    console.log("Post error: ", e)
  }
}

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    console.log('FurLang content launch!');

    window.marked = false;
    window.panel = browser.runtime.getURL("panel_dist.html");
    console.log("Panel: ", window.panel);


    browser.runtime.onConnect.addListener((res) => {
      if (res.name == 'FurLang_connect'){
        res.onMessage.addListener((msg) => {
          console.log("Content received message: ", msg);
          if (msg && !window.marked){
            start();
          }
        })
      }
    });

    load_sets().then((res) => {
      if (res && !window.marked){
        start();
      }
    });
  }
});