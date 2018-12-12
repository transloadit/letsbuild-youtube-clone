<template>
  <q-page class="flex">
    <q-card inline style="width: 500px;" v-for="vid in vidoes" v-bind:key="vid.id">
    <router-link :to="'/video/'+vid.id">
      <q-card-media>
        <img :src="vid.data.poster">
      </q-card-media>
      <q-card-title>{{vid.title}}</q-card-title>
      <q-card-main>
        <p>{{vid.data.license}}</p>
        <p class="text-faded">{{vid.data.caption}}</p>
      </q-card-main>
      <q-card-separator/>
      </router-link>
    </q-card>
    <h3 v-if="!vidoes.length">We have no videos in store currently. Please check later</h3>
  </q-page>
</template>

<script>
import axios from 'axios';

export default {
  data: () => ({
    vidoes: [],
  }),
  mounted: function mounted() {
    this.$q.loading.show({
      message: 'Loading available Videos',
      messageColor: 'blue',
      spinnerColor: 'white',
    });
    axios.get(`${window.base_url}/api/videos`)
      .then((response) => {
        this.vidoes = response.data;
        this.$q.loading.hide();
      })
      .catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Loading failed',
          icon: 'report_problem',
        });
        this.$q.loading.hide();
      });
  },
};
</script>
<style>
.inline-block {
  padding: 3px !important;
}
</style>

