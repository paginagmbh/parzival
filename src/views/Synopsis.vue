<template>
<container class="parzival-transcript" :manuscript="manuscript" :pages="pages" :verse="verse">
  <div class="parzival-transcript-view">
    <div class="tile is-ancestor">
      <div class="tile is-parent" :class="{ 'is-vertical': this.$mq.touch }">
        <div class="tile is-child" :class="{ 'is-6': this.$mq.desktop }">
          <transcript-viewer :manuscript="manuscript" :pages="pages"
                             :verse="verse" :syncScrolling="false"/>
        </div>
        <div class="tile is-child">
          <transcript-viewer :manuscript="otherManuscript" :pages="otherPages"
                             :verse="verse" v-if="otherPages"/>
        </div>
      </div>
    </div>
  </div>
</container>
</template>

<script>
export default {
  name: 'synopsis',
  props: ['manuscript', 'pages', 'verse']
}
</script>
