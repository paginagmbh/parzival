<template>
<div class="parzival-transcript-viewer parzival-overflow-scroll">
  <div class="hero" v-if="verseTitle && text.length == 0">
    <div class="hero-body">
      <article class="message">
        <div class="message-body content">
          <p>Ihre Suche nach „{{ lastSearch }}“ ergab keinen Treffer.</p>
          <p>Folgende Verse sind nicht transkribiert:</p>
          <div v-html="excludedVersesHtml"/>
        </div>
      </article>
    </div>
  </div>

  <article class="parzival-transcript-column"
           v-for="t in text"
           :key="manuscript + t.column"
           :data-manuscript="manuscript"
           :data-column="t.column" ref="columns">
    <header>{{ manuscriptSigil }} – {{ numTitle(t.column) }}</header>
    <section class="section">
      <table class="table parzival-content">
        <tbody>
          <tr v-for="(l, li) in t.contents" :key="li"
              class="parzival-verse-focus"
              @click="updateVerse(l.verse)">
              <td v-if="l.transpositionStart" class="parzival-transposition-row" :rowspan="l.transpositionRowSpan">
                <span class="transpositionArrow" :style="`height:${parseInt(l.transpositionRowSpan) * 1.5}em`" title="Versumstellung">&#160;<!--<i class="fa fa-arrows-v" aria-hidden="true" :style="`font-size:${parseInt(l.transpositionRowSpan) * 1.25}rem`"/>--></span>
              </td>
              <template v-else-if="l.transpositionPart"><!-- empty, no td here --></template>
              <td v-else class="parzival-transposition-row"></td>
              <th class="parzival-verse-num"
                  :class="{ 'is-active': verse === l.verse }"
                  :data-verse="l.verse"
                  v-waypoint="verseWaypoint">
                {{ l.verse }}
              </th>
              <td class="parzival-verse" v-html="l.html"></td>
          </tr>
        </tbody>
      </table>
    </section>
  </article>
  <button class="parzival-transcript-doc-toggle button is-info is-small"
          v-if="text.length > 0"
          @click="toggle('transcriptDocModal')">
    <i class="fa fa-info"></i>
  </button>
  <transcript-info :transcriptDocModal="transcriptDocModal" v-on:close-info="toggle('transcriptDocModal')" />
</div>
</template>

<script>
export { default } from './TranscriptViewer'
</script>
