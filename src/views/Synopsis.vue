<template>
<container class="parzival-synopsis parzival-fullheight" :manuscript="manuscript" :pages="pages" :verse="verse">
  <div class="tile is-ancestor">
    <div class="tile" :class="{ 'is-vertical': $mq.touch }">
      <div class="tile is-vertical is-parent">
        <nav class="tile is-child hero is-small" :data-manuscript="manuscript">
          <div class="hero-body title has-text-centered">
            {{ manuscriptSigil }} – {{ pageTitle }}
          </div>
        </nav>
        <transcript-viewer class="tile is-child"
                           :manuscript="manuscript" :pages="pages"
                           :verse="verse" :syncScrolling="false" />
        <facsimile-viewer class="tile is-child" v-if="$mq.desktop"
                          :manuscript="manuscript" :pages="pages" />
      </div>
      <div class="tile is-vertical is-parent">
        <nav class="tile is-child hero is-small" :data-manuscript="otherManuscript">
          <div class="hero-body title has-text-centered">
            {{ otherManuscriptSigil }} – {{ otherPageTitle }}
          </div>
        </nav>
        <transcript-viewer class="tile is-child"
                           :manuscript="otherManuscript" :pages="otherPages"
                           :verse="verse" v-if="otherPages"/>
        <facsimile-viewer class="tile is-child" v-if="$mq.desktop"
                          :manuscript="otherManuscript" :pages="otherPages" />
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
