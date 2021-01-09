<template>
<div class="parzival-container">
  <nav class="navbar is-dark">
    <div class="navbar-brand">
      <router-link class="navbar-item" :to="routes.introduction" title="Einführung">Einführung</router-link>
    </div>
    <div class="navbar-menu is-active">
      <div class="navbar-start">
        <router-link class="navbar-item is-info" to="/" title="Startseite / Informationen">
          <span class="icon"><i class="fa fa-home"></i></span>
        </router-link>
        <router-link class="navbar-item" :to="routes.transcript" title="Transkription" v-if="routes.transcript"><i class="fa fa-file-text-o"></i></router-link>
        <router-link class="navbar-item" :to="routes.singlePage" title="Einzelseite" v-if="routes.singlePage"><i class="fa fa-file-o"></i></router-link>
        <router-link class="navbar-item" :to="routes.doublePage" title="Doppelseite" v-if="routes.doublePage"><i class="fa fa-columns"></i></router-link>
        <router-link class="navbar-item" :to="routes.synopsis"   title="Synopse"
                     v-if="routes.synopsis"><i class="fa fa-link"></i></router-link>
        <a class="navbar-item parzival-transcript-doc-toggle"
          @click="toggle('transcriptDocModal')">
          <i class="fa fa-info"></i>
        </a>
         <transcript-info :transcriptDocModal="transcriptDocModal" v-on:close-info="toggle('transcriptDocModal')" />
      </div>
      <div class="navbar-end">
        <div class="navbar-item is-hidden-mobile" v-if="$route.name !== 'synopsis'">
          <nav class="breadcrumb">
            <ol>
              <li class="is-active"><a>{{ manuscriptSigil }}</a></li>
              <li class="is-active is-hidden-touch"><a>{{ manuscriptTitle }}</a></li>
              <li class="is-active"><a>{{ pageTitle }}</a></li>
            </ol>
          </nav>
        </div>
        <a class="navbar-item" :class="active('overviewModal')" @click="toggle('overviewModal')" title="Handschriftenüberblick" v-if="$route.name !== 'synopsis'">
          <i class="fa fa-th"></i>
        </a>
        <a class="navbar-item" :class="active('searchModal')" @click="toggle('searchModal')" title="Suche in der Handschrift"><i class="fa fa-search"></i></a>
        <router-link class="navbar-item is-size-4" :to="routes.otherManuscript" title="Handschrift wechseln (ohne äquivalente Stelle wird Bl. 1r der Zielhandschrift angezeigt)" v-if="$route.name !== 'synopsis'">
          <i class="fa fa-exchange"></i>
        </router-link>
        <router-link class="navbar-item is-size-4" :to="routes.prevPage || ''" :disabled="!routes.prevPage"  v-if="$route.name !== 'synopsis'" title="Vorherige Seite">
          <i class="fa fa-chevron-left"></i>
        </router-link>
        <router-link class="navbar-item is-size-4" :to="routes.nextPage || ''" :disabled="!routes.nextPage"  v-if="$route.name !== 'synopsis'" title="Nächste Seite">
          <i class="fa fa-chevron-right"></i>
        </router-link>
      </div>
    </div>
  </nav>
  <slot></slot>
  <div class="parzival-overview modal" :class="active('overviewModal')" @keyup.esc="toggle('overviewModal')" v-focus="overviewModal" tabindex="1000" v-if="$route.name !== 'synopsis'">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="section">
        <div class="columns is-multiline is-gapless is-mobile">
          <div class="column is-6-mobile is-3-tablet is-2-desktop is-1-fullhd" v-for="p in manuscriptPages" :key="p.key">
            <router-link class="parzival-facsimile-slide" tag="div" :to="pageRoute(p)" :class="{ 'is-active': activeSlide(p) }"><img v-lazy="p.src" :alt="p.page"/>
              <p :class="transcriptClass(p)">{{ p.title }}</p>
            </router-link>
          </div>
        </div>
      </div>
    </div>
    <button class="modal-close is-large" aria-label="close" @click="toggle('overviewModal')"></button>
  </div>
  <div class="parzival-search modal" :class="active('searchModal')" tabindex="1001">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="hero is-large">
        <div class="hero-body">
          <div class="container">
            <div class="field">
              <label class="label has-text-light">
                Ihre Suchanfrage<br>
                z. B.  <i>10r</i>, <i>123</i>, <i>823.10[1]</i>, <i>Ep 2</i> oder <i>Pr 100</i> (nur Hs. V)
              </label>
              <div class="control has-icons-left">
                <input class="input is-medium" type="text" placeholder="Suchanfrage" v-model.trim="query" v-focus="searchModal" @keyup.esc="toggle('searchModal')" @keyup.enter="searchAll" :class="{ 'is-danger': notFound }"/><span class="icon is-left"><i class="fa fa-search"></i></span>
              </div>
              <div class="help is-danger" v-if="notFound">
                Ihre Suchanfrage lieferte im ausgewählten Textzeugen kein Ergebnis.
                Bitte beachten Sie, dass in Hs. V' die Bücher I bis XIV von Wolframs
                ›Parzival‹ (Verse 1.1 bis 733.30) fehlen. Nicht transkribiert wurden
                von Hs. V und Hs. V' die Abschnitte <span v-html="excludedVersesDisplayForm"/>.
              </div>
            </div>
            <div class="field is-grouped">
              <div class="control">
                <button class="button is-medium is-primary" @click="searchVerse" title="Suche Vers">Vers</button>
              </div>
              <div class="control">
                <button class="button is-medium" @click="searchPage" title="Suche Blatt">Blatt</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button class="modal-close is-large" aria-label="close" @click="toggle('searchModal')"></button>
    </div>
  </div>
</div>
</template>

<script>
export { default } from './Container'
</script>
