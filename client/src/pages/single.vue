<template>
  <q-page>
    <div style="margin: 30px auto; width: 700px;">
      <video v-if="video.id" id="my-player" ref="my-player" class="video-js vjs-default-skin"
      controls crossorigin playsinline
      data-plyr-config='{ "title": "This is an example video", "volume": 1, "debug": true }'
      :poster="video.data.poster">
        <source v-for="(src, index) in video.data.sources"  v-bind:key="index"
        :src="src.src" :type="src.type" :size="src.size">
      </video>
      <h3 v-if="!video.id">Cannot fetch video</h3>
    </div>
    <div class="comments">
          <disqus shortname="your_shortname_disqus" url=""></disqus>
    </div>
  </q-page>
</template>

<script>
import Plyr from 'plyr';
import axios from 'axios';
import 'plyr/dist/plyr.css';

export default {
  data: function data() {
    return {
      player: '',
      video: {},
    };
  },
  components: {
  },
  mounted: function mounted() {
    this.$q.loading.show({
      message: 'Preparing all video formats for your graceful view',
      messageColor: 'blue',
      spinnerColor: 'white',
    });
    axios.get(`${window.base_url}/api/video/${this.$route.params.id}`)
      .then((response) => {
        this.video = response.data;
        setTimeout(() => { this.player = new Plyr(this.$refs['my-player']); this.$q.loading.hide(); }, 50);
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
  },
};
</script>

<style>
.plyr--video {
    max-height: 100%;
    width: 100%;
    margin: 2em;
}
.plyr__video-wrapper {
    background: #000;
    border-radius: inherit;
    overflow: hidden;
    position: relative;
    z-index: 0;
    object-fit: fill;
}
</style>
