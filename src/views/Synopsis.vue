<template>
<container class="parzival-synopsis parzival-fullheight" :manuscript="manuscript" :pages="pages" :verse="verse">
  <div class="tile is-ancestor">
    <div class="tile" :class="{ 'is-vertical': $mq.touch }">
      <div class="tile is-vertical is-parent">
        <nav class="tile is-child hero is-primary is-small">
          <div class="hero-body title has-text-centered">
            {{ manuscript }} – {{ pages }}
          </div>
        </nav>
        <transcript-viewer class="tile is-child"
                           :manuscript="manuscript" :pages="pages"
                           :verse="verse" :syncScrolling="false" />
      </div>
      <div class="tile is-vertical is-parent">
        <nav class="tile is-child hero is-info is-small">
          <div class="hero-body title has-text-centered">
            {{ otherManuscript }} – {{ otherPages }}
          </div>
        </nav>
        <transcript-viewer class="tile is-child"
                           :manuscript="otherManuscript" :pages="otherPages"
                           :verse="verse" v-if="otherPages"/>
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
