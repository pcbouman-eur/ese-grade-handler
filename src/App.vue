<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <h3>ESE Grade Handler</h3>
      </div>

      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main>
      <v-tabs centered v-model="currentTab">
        <v-tab>Welcome</v-tab>
        <v-tab>Combiner</v-tab>
        <v-tab>Injector</v-tab>
      </v-tabs>
      <Welcome v-if="currentTab == 0" />
      <Combiner v-else-if="currentTab == 1" />
      <Injector v-else-if="currentTab == 2" />
    </v-main>
  </v-app>
</template>

<script>
import Welcome from './components/Welcome';
import Combiner from './components/Combiner';
import Injector from './components/Injector';

export default {
  name: 'App',

  components: {
    Combiner,
    Injector,
    Welcome
  },

  data: () => ({
    currentTab: 0
  }),
};
</script>
