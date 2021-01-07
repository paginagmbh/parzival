<template>
<container class="parzival-synopsis parzival-fullheight" :manuscript="manuscript" :pages="pages"
    :verse="verse" v-on:search-for="(payload) => lastSearch = payload">
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
                :class="{ 'is-active': r.active }"
                :key="ri"
                @click="updateVerse(r.getVerse('V'))">
              <!-- page sigle for V -->
              <td class="parzival-column"
                  :class="{ 'is-active': r.V.verse == verse }">{{ r.V.content.length ? r.V.content.map(c => c.column).join(" / ") : '–' }}</td>
              <!-- transposition arrow for V -->
              <td v-if="r.V.transpositionStart" class="parzival-transposition-row active right" :rowspan="r.V.transpositionRowSpan">
              </td>
              <template v-else-if="r.V.transpositionPart"><!-- empty, no td --></template>
              <td v-else class="parzival-transposition-row"></td>
              <!-- verse number for V -->
              <td class="parzival-verse-num parzival-verse-focus"
                  :class="{ 'is-active': r.V.verse == verse }"
                  :data-verse="r.V.verse"
                  v-waypoint="r.waypoint">
                  {{ r.V.verse }}
              </td>
              <!-- verse content for V -->
              <td class="parzival-verse parzival-verse-left">
                <div v-for="c in r.V.content" :key="c.column"
                    v-html="c.html"></div></td>
              <!-- verse content for VV -->
              <td class="parzival-verse parzival-verse-right">
                <div v-for="c in r.VV.content" :key="c.column"
                    v-html="c.html"></div></td>
              <!-- verse number for VV -->
              <td class="parzival-verse-num parzival-verse-focus"
                  :class="{ 'is-active': r.VV.verse == verse }">
                  {{ r.VV.verse }}
              </td>
              <!-- transposition arrow for VV -->
              <td v-if="r.VV.transpositionStart"
                class="parzival-transposition-row active left"
                :rowspan="r.VV.transpositionRowSpan"
                title="Versumstellung">
                </td>
              <template v-else-if="r.VV.transpositionPart"><!-- empty, no td --></template>
              <td v-else class="parzival-transposition-row"></td>
              <!-- page sigle for VV -->
              <td class="parzival-column"
                  :class="{ 'is-active': r.VV.verse == verse }">{{ r.VV.content.length ? r.VV.content.map(c => c.column).join(" / ") : '–' }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else>
          <article class="message">
            <div class="message-body content">
              <p>Ihre Suche nach „{{ lastSearch }}“ ergab keinen Treffer.</p>
              <p>Folgende Verse sind nicht transkribiert:</p>
              <div v-html="excludedVersesHtml"/>
            </div>
          </article>
        </div>
      </div>
    </div>
    <div class="tile is-parent parzival-min-tile" v-if="verse">
      <div class="tile is-child hero is-small is-dark">
        <div class="hero-body">
          <nav class="pagination is-small is-centered">
            <router-link class="pagination-previous" :to="prevSynopsis || ''" :disabled="!prevSynopsis">
              <i class="fa fa-chevron-left"></i>
            </router-link>
            <router-link class="pagination-next" :to="nextSynopsis || ''" :disabled="!nextSynopsis">
              <i class="fa fa-chevron-right"></i>
            </router-link>
            <ul class="pagination-list">
              <li v-for="(p, pi) in pagination" :key="pi">
                <router-link class="pagination-link"
                   :class="{'is-current': p.index === page }"
                   :to="toSynopsis(p.title)">
                  {{ p.title }}
                </router-link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
    <div class="tile is-parent" v-if="$mq.desktop">
      <facsimile-viewer class="tile is-child"
                        :manuscript="manuscript" :pages="pages" :numbered="true" />
      <facsimile-viewer class="tile is-child"
                        :manuscript="otherManuscript" :pages="otherPages" :numbered="true" />
    </div>
  </div>
</container>
</template>

<script>
export { default } from './Synopsis'
</script>
