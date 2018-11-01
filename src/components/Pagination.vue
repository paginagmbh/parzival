<template>
<nav class="parzival-pagination pagination is-centered is-small">
  <router-link class="button is-light pagination-previous" :to="routes.prevPage">
    <i class="fa fa-angle-left"></i>
  </router-link>
  <router-link class="button is-light pagination-next" :to="routes.nextPage">
    <i class="fa fa-angle-right"></i>
  </router-link>
</nav>
</template>

<script>
export default { name: 'pagination', props: ['manuscript', 'pages'] }
</script>
