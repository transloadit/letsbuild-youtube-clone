<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar
        color="primary"
        :inverted="$q.theme === 'ios'"
      >
        <q-toolbar-title>
        <router-link :to="'/'" style="color: white; text-decoration:none;">
          2hr YouTube “Clone”
        </router-link>
          <div slot="subtitle">Powered by
            <a href="https://transloadit.com">Transloadit</a>,
            <a href="https://uppy.io">Uppy</a> and Firebase
            </div>
          <q-btn
            color="standard"
            @click="openUppyModal"
            label="Upload Videos"
            style="float:right;"
          />
        </q-toolbar-title>
      </q-toolbar>
    </q-layout-header>

    <q-page-container>
      <q-modal v-model="opened">
        <q-btn
          color="primary"
          @click="opened = false"
          label="Close"
        />
        <div ref="select-files" id="select-files"></div>
      </q-modal>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import axios from 'axios';

const Uppy = require('@uppy/core');
const Transloadit = require('@uppy/transloadit');
const Dashboard = require('@uppy/dashboard');
const Webcam = require('@uppy/webcam');
const Instagram = require('@uppy/instagram');
const Dropbox = require('@uppy/dropbox');
const GoogleDrive = require('@uppy/google-drive');
const Url = require('@uppy/url');

require('@uppy/core/dist/style.css');
require('@uppy/dashboard/dist/style.css');
require('@uppy/webcam/dist/style.css');
require('@uppy/url/dist/style.css');

export default {
  name: 'MyLayout',
  data: function data() {
    return {
      opened: false,
      uppy: '',
      results: {}
    };
  },
  methods: {
    openUppyModal: function (event) {
      this.uppy.getPlugin('Dashboard').openModal();
    },
    closeUppyModal: function (event) {
      this.uppy.getPlugin('Dashboard').closeModal();
    }
  },
  mounted: function mounted() {
    axios.defaults.headers.common = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    this.uppy = Uppy({
      id: 'uppy',
      autoProceed: false,
      allowMultipleUploads: true,
      debug: false,
      restrictions: {
        maxFileSize: 20971520,
        maxNumberOfFiles: 20,
        minNumberOfFiles: 1,
        allowedFileTypes: ['.mov', '.MOV', '.mp4', '.MP4', '.webm', '.WEBM', '.mkv', '.MKV'],
      },
    })
      .use(Dashboard, {
        // inline: true,
        // target: this.$refs['select-files'],
        disablePageScrollWhenModalOpen: false,
        closeModalOnClickOutside: true,
        metaFields: [
          { id: 'title', name: 'Title', placeholder: 'Video Title' },
          { id: 'license', name: 'License', placeholder: 'specify license' },
          { id: 'caption', name: 'Caption', placeholder: 'describe what the video is about' },
        ],
        note: 'Maximum size for this demo is 20MB. Please Edit the description of each video before uploading',
      })
      .use(Webcam, { target: Dashboard })
      .use(Instagram, { target: Dashboard, serverUrl: 'https://api2.transloadit.com/companion', serverPattern: /\.transloadit\.com$/ })
      .use(GoogleDrive, { target: Dashboard, serverUrl: 'https://api2.transloadit.com/companion', serverPattern: /\.transloadit\.com$/ })
      .use(Dropbox, { target: Dashboard, serverUrl: 'https://api2.transloadit.com/companion', serverPattern: /\.transloadit\.com$/ })
      .use(Url, { target: Dashboard, serverUrl: 'https://api2.transloadit.com/companion', serverPattern: /\.transloadit\.com$/ })
      .use(Transloadit, {
        params: {
          auth: {
            key: '7fcf63e0d5f211e8b8fd8d320311d96d',
          },
          // It's more secure to use a template_id and enable
          // Signature Authentication
          steps: {
            [':original']: {
              robot: '/upload/handle',
            },
            webm_720p_encoded: {
              use: [':original'],
              robot: '/video/encode',
              result: true,
              ffmpeg_stack: 'v3.3.3',
              preset: 'webm',
              width: 1280,
              height: 720,
            },
            thumbnailed: {
              use: [':original'],
              robot: '/video/thumbs',
              result: true,
              ffmpeg_stack: 'v3.3.3',
            },
            browser1080_encoded: {
              use: [':original'],
              robot: '/video/encode',
              result: true,
              ffmpeg_stack: 'v3.3.3',
              height: 1080,
              preset: 'ipad-high',
              width: 1920,
            },
            browser1440_encoded: {
              use: [':original'],
              robot: '/video/encode',
              result: true,
              ffmpeg_stack: 'v3.3.3',
              height: 1440,
              preset: 'ipad-high',
              width: 2560,
            },
            exported: {
              use: ['webm_720p_encoded', 'browser1080_encoded', 'browser1440_encoded', 'thumbnailed'],
              robot: '/s3/store',
              credentials: 's3_cred',
            },
          },
        },
        waitForEncoding: true,
      })
      .on('transloadit:result', (stepName, result) => {
        const file = this.uppy.getFile(result.localId);
      });
    this.uppy.on('complete', (result) => {
      result.successful.forEach((element, index) => {
        this.$q.loading.show({
          message: 'Saving encoded videos to firebase',
          messageColor: 'black',
          spinnerColor: 'white',
        });
        axios.post(`${window.base_url}/api/save-video/${element.transloadit.assembly}`, element.meta)
        .then((response) => {
          // this.vidoes = response.data;
          if(index + 1 == result.successful.length ){
            this.$q.loading.hide();
            this.$q.notify({
              color: 'positive',
              position: 'top',
              message: 'All files uploaded. videos ready. Please visit the home page',
              icon: 'report_problem',
            });
            this.uppy.getPlugin('Dashboard').closeModal();
          }

        })
        .catch(() => {
          this.$q.loading.hide();
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: 'Loading failed',
            icon: 'report_problem',
          });
        });
      });
    });
  },
};
</script>

<style>
</style>
