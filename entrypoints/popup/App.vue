
<template>
  <h1>FurLang plug-in</h1>
  <MDBCard class="m-2 p-4">
    <MDBCardBody class="p-0">
      <MDBBtn @click="switch_click" :outline="switch_outline" size="lg" color="primary" title="Auto start(When webpage is in English.)"> {{ switch_text }} </MDBBtn>
    </MDBCardBody>
  </MDBCard>

  <MDBCard class="p-1 m-2">
    <MDBCardBody class="container-fluid rounded p-1 m-1">
        <MDBCardTitle>Settings</MDBCardTitle>
        <div class="d-flex align-items-center shadow-inner rounded m-1 p-1">
          <div class="m-2">Server address:</div>
          <input @change="push_settings" type="url" v-model="ip_addr" class="form-control" style="flex: 1;"/>
        </div>
        <div class="shadow-inner rounded m-1 p-1">
          <div class="d-flex align-items-center" title="The mark colors change with familiarity.
            Choose two colors for unfamiliar word and familiar word">
            <div class="m-2">Mark colors:</div>
            <input @change="push_settings" type="color" v-model="colors[0]" class="form-control form-control-color m-1 color_picker p-0 border-0" title="The color for familiar word."/>
            <input @change="push_settings" type="color" v-model="colors[1]" class="form-control form-control-color m-1 color_picker p-0 border-0" title="The color for unfamiliar word."/>
          </div>
          <MDBCheckbox @change="push_settings" v-model="transparency_change" class="m-1" label="Transparency change" title="The transparency of marks change with familiarity" inline/>
        </div>
      </MDBCardBody>
  </MDBCard>

</template>

<script setup lang="ts">
  import { MDBCard, MDBCardBody, MDBCardTitle, MDBCheckbox, MDBBtn } from "mdb-vue-ui-kit";
  import { ref, toRaw, watch } from "vue";

  const default_vars = {
    "colors": ['#66bdff', '#ffb142'],
    "status": false,
    "transparency_change": true,
    "ip_addr": '127.0.0.1:1028'
  };

  // Load settings
  const colors = ref(default_vars.colors);
  const status = ref(default_vars.status)
  const transparency_change = ref(default_vars.transparency_change);
  const ip_addr = ref(default_vars.ip_addr);
  browser.storage.local.get(default_vars).then(function(result){
    colors.value = result['colors'];
    status.value = result['status'];
    transparency_change.value = result['transparency_change'];
    ip_addr.value = result['ip_addr'];
    console.log('Settings loaded.');
  });

  function push_settings(){
    browser.storage.local.set({
      "colors": [colors.value[0], colors.value[1]],
      "status": status.value,
      "transparency_change": transparency_change.value,
      "ip_addr": ip_addr.value
    }).then(function(){
      console.log('Settings saved.');
    })
  }

  // Switch control
  const switch_outline = ref(!status.value ? 'info' : '');
  const switch_text = ref(!status.value ? 'Disabled' : 'Enabled');
  watch(status, () => {
    switch_outline.value = !status.value ? 'info' : '';
    push_settings();
    switch_status();
    switch_text.value = !status.value ? 'Disabled' : 'Enabled';
  });
  function switch_click(){
    status.value = !status.value;
    console.log('Status changed: ' + status.value);
  }

  function getCurrentTabId() {
    return new Promise<number | null>((resolve, reject) => {
      browser.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
        if (tabs.length && tabs[0] && typeof tabs[0].id === 'number') {
          resolve(tabs[0].id);
        } else {
          // 明确处理tabs为空或tabs[0]不存在的情况，直接返回null
          resolve(null);
        }
      });
    })
  }

  async function switch_status(){

    const tabId = await getCurrentTabId()
    if(tabId === null) return true
    const connect = browser.tabs.connect(tabId, {name: 'FurLang_connect'});
    connect.postMessage(status.value);
  }

</script>

<style>
  .color_picker{
    flex: 1;
    height: 1.5rem;
  }

</style>
