<template>
<container class="parzival-synopsis parzival-fullheight" :manuscript="manuscript" :pages="pages" :verse="verse">
  <div class="tile is-ancestor is-vertical">
    <nav class="tile is-parent parzival-min-tile">
      <div class="tile is-child hero is-small" :data-manuscript="manuscript">
        <div class="hero-body has-text-centered">
          <p class="subtitle">{{ manuscriptSigil }} ({{ manuscriptTitle }})</p>
        </div>
      </div>
      <div class="tile is-child hero is-small" :data-manuscript="otherManuscript">
        <div class="hero-body has-text-centered">
          <p class="subtitle">{{ otherManuscriptSigil }} ({{ otherManuscriptTitle }})</p>
        </div>
      </div>
    </nav>
    <div class="tile is-parent parzival-overflow-scroll">
      <div class="tile is-child">
        <table class="table is-fullwidth is-narrow is-striped parzival-content" v-if="verse">
          <tbody>
            <tr v-for="(r, ri) in synopsis"
                :key="ri"
                :class="{ 'is-active': r[0] === verse }"
                @click="updateVerse(r[0])">
              <td class="parzival-column">{{ r[1].length ? r[1][0].column : '–' }}</td>
              <td class="parzival-verse-num parzival-verse-focus"
                  :class="{ 'is-active': r[0] === verse }"
                  :data-verse="r[0]">{{ verse2Desc(r[0]) }}</td>
              <td class="parzival-verse parzival-verse-left">
                <div v-for="c in r[1]" :key="c.column"
                     :title="c.column" v-html="c.html"></div>
              </td>
              <td class="parzival-verse parzival-verse-right">
                <div v-for="c in r[2]" :key="c.column"
                     :title="c.column" v-html="c.html"></div>
              </td>
              <td class="parzival-verse-num parzival-verse-focus"
                  :class="{ 'is-active': r[0] === verse }">{{ verse2Desc(r[0]) }}</td>
              <td class="parzival-column">{{ r[2].length ? r[2][0].column : '–' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="tile is-parent parzival-min-tile" v-if="verse">
      <div class="tile is-child hero is-small is-dark">
        <div class="hero-body">
          <nav class="pagination is-centered">
            <router-link class="pagination-previous" :to="prevPage" :disabled="!prevPage">
              <i class="fa fa-chevron-left"></i>
            </router-link>
            <router-link class="pagination-next" :to="nextPage" :disabled="!nextPage">
              <i class="fa fa-chevron-right"></i>
            </router-link>
            <ul class="pagination-list">
              <li v-for="(p, pi) in pagination" :key="pi">
                <router-link class="pagination-link"
                   :class="{'is-current': p.index === page }"
                   :to="toVerse(p.title)">
                  {{ p.title }}…
                </router-link>
              </li>
            </ul>
          </nav>
        </div>
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
