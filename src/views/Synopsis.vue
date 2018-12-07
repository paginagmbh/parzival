<template>
<container class="parzival-synopsis parzival-fullheight" :manuscript="manuscript" :pages="pages" :verse="verse">
  <div class="tile is-ancestor is-vertical">
    <nav class="tile is-parent">
      <div class="tile is-child hero is-small" :data-manuscript="manuscript">
        <div class="hero-body has-text-centered">
          <p class="subtitle">{{ manuscriptSigil }}</p>
        </div>
      </div>
      <div class="tile is-child hero is-small" :data-manuscript="otherManuscript">
        <div class="hero-body has-text-centered">
          <p class="subtitle">{{ otherManuscriptSigil }}</p>
        </div>
      </div>
    </nav>
    <div class="tile is-parent parzival-overflow-scroll">
      <div class="tile is-child">
        <table class="table is-fullwidth is-narrow is-striped parzival-content">
          <tbody>
            <tr v-for="v in verses"
                :key="v"
                :class="{ 'is-active': v === verse }"
                @click="updateVerse(v)">
              <td class="parzival-verse-num parzival-verse-focus"
                  v-waypoint="verseWaypoint">{{ v }}</td>
              <td class="parzival-verse" v-html="html(v, manuscript)"></td>
              <td class="parzival-verse-num parzival-verse-focus">{{ v }}</td>
              <td class="parzival-verse" v-html="html(v, otherManuscript)"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="tile is-parent" v-if="$mq.desktop">
      <facsimile-viewer class="tile is-child"
                        :manuscript="manuscript" :pages="pages" />
      <facsimile-viewer class="tile is-child"
                        :manuscript="otherManuscript" :pages="otherPages" />
    </div>
  </div>
</container>
</template>

<script>
export { default } from './Synopsis'
</script>
