<template>
<container class="parzival-transcript parzival-fullheight"
           :manuscript="manuscript" :pages="pages" :verse="verse">
  <div class="tile is-ancestor">
    <div class="tile is-parent" :class="{ 'is-vertical': $mq.touch }">
      <transcript-viewer class="tile is-child" :class="{ 'is-5': $mq.widescreen, 'is-4': $mq.fullhd }"
                         :manuscript="manuscript" :pages="pages" :verse="verse"/>

      <facsimile-viewer class="tile is-child"
                        :manuscript="manuscript" :pages="pages" />
    </div>
  </div>
</container>
</template>

<script>
export default {
  name: 'transcript',
  props: ['manuscript', 'pages', 'verse']
}
</script>
