<template>
<container class="parzival-transcript parzival-fullheight"
           :manuscript="manuscript" :pages="pages" :verse="verse"
           v-on:search-for="(payload) => lastSearch = payload">
  <div class="tile is-ancestor">
    <div class="tile is-parent" :class="{ 'is-vertical': $mq.touch }">
      <transcript-viewer class="tile is-child" :class="{ 'is-5': $mq.widescreen, 'is-4': $mq.fullhd }"
           :lastSearch="lastSearch" :manuscript="manuscript" :pages="pages" :verse="verse"/>

      <facsimile-viewer class="tile is-child"
                        :manuscript="manuscript" :pages="pages" :numbered="true" />
    </div>
  </div>
</container>
</template>

<script>
export default {
  name: 'transcript',
  props: ['manuscript', 'pages', 'verse'],
  data: () => {
    return { lastSearch: '' }
  }
}
</script>
