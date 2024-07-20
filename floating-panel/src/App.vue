<link href="https://use.fontawesome.com/releases/v5.15.1/css/all.css" rel="stylesheet"/>
<template>
  <MDBCard class="shadow-0">
    <MDBCardBody>
      <MDBCardText class="shadow-2">
        <MDBTabs vertical v-model="activeTabId1">
          <MDBTabNav tabsClasses="mb-3 text-center">
            <MDBTabItem :wrap="false" tabId="ex1-1" href="ex1-1"><img src="../public/book-solid.svg" style="width: 1.4em;float: left;">Definitions</MDBTabItem>
            <MDBTabItem :wrap="false" tabId="ex1-2" href="ex1-2"><img src="../public/chart-line-solid.svg" style="width: 1.4em;float: left;">Knowledge mastery</MDBTabItem>
            <MDBTabItem :wrap="false" tabId="ex1-3" href="ex1-3"><img src="../public/card-heading.svg" style="width: 1.6em;float: left;">Notes</MDBTabItem>
          </MDBTabNav>

          <MDBTabContent>
            <MDBTabPane tabId="ex1-1"  v-html="introductin_html"></MDBTabPane>
            <MDBTabPane tabId="ex1-2">
              <MDBTable hover>
                <tbody>
                  <tr>
                    <th scope="row">Frequency</th>
                    <td>{{ infos.frequency }}</td>
                  </tr>
                  <tr>
                    <th scope="row">Familiarity</th>
                    <td>{{ infos.familiarity }}</td>
                  </tr>
                  <tr>
                    <th scope="row">Last used date</th>
                    <td>{{ infos.last_used_date }}</td>
                  </tr>
                </tbody>
              </MDBTable>
              <MDBListGroup light small>
                <h5 class="bg-light p-2 border-top border-bottom">Your example sentence</h5>
                <MDBListGroupItem v-for="sentence in sentences" :key="sentence" spacing action>
                  {{ sentence }}
                  <MDBBtn @click="sentences.splice(sentences.indexOf(sentence), 1);update_sentences()" class="float-end" style="font-size: larger;" outline="danger" floating>✗</MDBBtn>
                </MDBListGroupItem>
              </MDBListGroup>
            </MDBTabPane>
            <MDBTabPane tabId="ex1-3">
              <MDBListGroup light small>
                <MDBListGroupItem v-for="(note, index) in notes" :key="index" class="d-flex" spacing action>
                  <MDBTextarea style="margin: 0px 0px; background-color: unset; color: unset;" v-model="notes[index]" @update:model-value="update_notes()"></MDBTextarea>
                  <MDBBtn @click="notes.splice(index, 1);update_notes()"  outline="danger" style="margin-left: 0.6em; font-size: larger;" floating>✗</MDBBtn>
                </MDBListGroupItem>
                <MDBBtn @click="notes.push('')" color="secondary" style="font-weight: bold; margin: 1em 5em;">New note</MDBBtn>
              </MDBListGroup>
            </MDBTabPane>
          </MDBTabContent>
        </MDBTabs>
      </MDBCardText>
    </MDBCardBody>
  </MDBCard>
</template>

<script setup lang="ts">
/* eslint-disable */
  import { MDBCard, MDBCardBody, MDBCardTitle, MDBCardText } from 'mdb-vue-ui-kit'
  import { MDBTabs, MDBTabNav, MDBTabContent, MDBTabItem, MDBTabPane } from 'mdb-vue-ui-kit';
  import { MDBTable } from 'mdb-vue-ui-kit';
  import { MDBListGroup, MDBListGroupItem } from "mdb-vue-ui-kit";
  import { MDBTextarea } from 'mdb-vue-ui-kit';
  import { MDBBtn } from "mdb-vue-ui-kit";
  import { ref, watch } from 'vue';
  import axios, { Axios } from "axios";

  const activeTabId1 = ref('ex1-1');

  interface MwordInfo{
    'word': string, // lemmatized word
    'frequency': number,
    'familiarity': number,
    'last_used_date': string,
  }

  interface wordInfo{
    'word': string, // lemmatized word
    'frequency': number,
    'familiarity': number,
    'sentences': string[],
    'last_used_date': string,
    'notes': string[]
  }
  async function FurPost(type: string, data: any){
    try{
      const msg = {type, data};
      const res = (await axios_instance.post("", msg)).data;
      return res;
    }catch(e){
      console.log("Post error: ", e)
      return e;
    }
  }

  const infos = ref({} as MwordInfo);
  const introductin_html = ref("");
  const sentences = ref([]);
  const notes = ref([]);
  let axios_instance:Axios;

  function setup(info: wordInfo, server: String) {

    infos.value.familiarity = info.familiarity;
    infos.value.frequency = info.frequency;
    infos.value.last_used_date = info.last_used_date;
    infos.value.word = info.word;
    sentences.value = info.sentences;
    notes.value = info.notes;

    axios_instance = axios.create({
      baseURL: "http://" + server
    });
    FurPost("query_dicts", infos.value.word).then((res: [string])=>{
      introductin_html.value = res.join('\n');
    });
  }

  window.addEventListener('message', function(event) {
    console.log('Received message:', event.data);
    if(event.data[0] === 'setup'){
      console.log("setup");
      setup(event.data[1], event.data[2]);
    }
  });

  function update_notes(){
    console.log("Updating ", notes.value);

    FurPost("update_notes", [infos.value.word, notes.value]);
  }
  function update_sentences(){
    FurPost("update_sentences", [infos.value.word, sentences.value]);
  }

  // setup(["paw", {'frequency': 1,
  //           'familiarity': 0.01,
  //           'sentences': ["What can I say?", "Furry is the best!!!", "I don't know what should I write here."],
  //           'last_used_date': "2023-01-01",
  //           'notes': ["This is a note, it records something", "Wow, this is so interesting"]}], "127.0.0.1:1028");
</script>

<style>
body{
  margin: 0px;
}
</style>
