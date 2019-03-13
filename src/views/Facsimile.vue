<template functional>
<container class="parzival-fullheight" :manuscript="props.manuscript" :pages="props.pages" :verse="props.verse">
  <facsimile-viewer :manuscript="props.manuscript" :pages="props.pages" :numbered="false"/>
</container>
</template>
