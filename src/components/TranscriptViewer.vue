<template>
<div class="parzival-transcript-viewer">
  <article class="message is-large is-warning" v-if="text.length == 0">
    <div class="message-body">
      <p>Kein Transkript für diese Seite</p>
    </div>
  </article>
  <article class="parzival-transcript-column"
           v-for="t in text"
           :key="manuscript + t.column"
           :data-manuscript="manuscript"
           :data-column="t.column" ref="columns">
    <header>{{ manuscriptSigil }} – {{ numTitle(t.column) }}</header>
    <section class="section">
      <table class="table">
        <tbody>
          <tr v-for="(l, li) in t.contents" :key="li"
              class="parzival-verse-focus"
              @click="updateVerse(l.verse)">
            <template v-if="l.type == 'heading'">
              <td class="parzival-heading" colspan="2">
                <div v-for="(h, hi) in l.heading" :key="hi">[{{ h }}]</div>
              </td>
            </template>
            <template v-if="l.type == 'verse'">
              <th class="parzival-verse-num"
                  :class="{ 'is-active': l.type === 'verse' && verse === l.verse }"
                  v-waypoint="verseWaypoint">
                <span>{{ l.verse }}</span>
              </th>
              <td class="parzival-verse" v-html="l.html"></td>
            </template>
          </tr>
        </tbody>
      </table>
    </section>
  </article>
</div>
</template>

<script>
export { default } from './TranscriptViewer'
</script>
