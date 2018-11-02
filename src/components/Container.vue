<template>
<div class="parzival-container">
  <slot></slot>
  <div class="parzival-navigation-controls">
    <div class="field has-addons">
      <div class="control">
        <router-link class="button is-info" to="/" title="Startseite/ Informationen"><span>Über diese Site</span><span class="icon"><i class="fa fa-home"></i></span></router-link>
      </div>
      <div class="control">
        <router-link class="button" :to="routes.otherManuscript" title="Handschrift wechseln"><i class="fa fa-exchange"></i></router-link>
      </div>
      <div class="control"><a class="button" :class="active('overviewModal')" @click="toggle('overviewModal')" title="Handschriftenüberblick"><i class="fa fa-th"></i></a></div>
      <div class="control"><a class="button" :class="active('searchModal')" @click="toggle('searchModal')" title="Suche in der Handschrift"><i class="fa fa-search"></i></a></div>
      <div class="control">
        <router-link class="button" :to="routes.prevPage" :disabled="!routes.prevPage" title="Vorherige Seite"><i class="fa fa-angle-left"></i></router-link>
      </div>
      <div class="control">
        <router-link class="button" :to="routes.nextPage" :disabled="!routes.nextPage" title="Nächste Seite"><i class="fa fa-angle-right"></i></router-link>
      </div>
      <div class="control">
        <router-link class="button" :to="routes.singlePage" title="Einzelseite"><i class="fa fa-file-o"></i></router-link>
      </div>
      <div class="control">
        <router-link class="button" :to="routes.doublePage" title="Doppelseite"><i class="fa fa-files-o"></i></router-link>
      </div>
      <div class="control">
        <router-link class="button" :to="routes.transcript" title="Transkript"><i class="fa fa-file-text-o"></i></router-link>
      </div>
      <div class="control">
        <router-link class="button" :to="routes.synopsis" title="Synopsis"><i class="fa fa-link"></i></router-link>
      </div>
    </div>
  </div>
  <div class="parzival-location box">
    <nav class="breadcrumb">
      <ol>
        <li class="is-active"><a>{{ manuscript }}</a></li>
        <li class="is-active"><a>{{ pageTitle }}</a></li>
        <li class="is-active"><a>{{ verseTitle }}</a></li>
      </ol>
    </nav>
  </div>
  <div class="parzival-overview modal" :class="active('overviewModal')" @keyup.esc="toggle('overviewModal')" v-focus="overviewModal" tabindex="1000">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="section">
        <div class="columns is-multiline is-gapless is-mobile">
          <div class="column is-6-mobile is-3-tablet is-2-desktop is-1-fullhd" v-for="p in manuscriptPages" :key="p.key">
            <router-link class="parzival-facsimile-slide" tag="div" :to="pageRoute(p)" :class="{ 'is-active': activeSlide(p) }"><img v-lazy="p.src" :alt="p.page"/>
              <p :class="transcriptClass(p)">{{ p.page }}</p>
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
              <div class="control has-icons-left">
                <input class="input is-medium" type="text" placeholder="z. B. 30v oder 123 oder 700.20[1]" v-model.trim="query" v-focus="searchModal" @keyup.esc="toggle('searchModal')" @keyup.enter="search" :class="{ 'is-danger': notFound }"/><span class="icon is-left"><i class="fa fa-search"></i></span>
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
