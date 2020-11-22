<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <h3>ESE Grade Wrangling Tool</h3>
      </div>

      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main>
      <v-tabs centered v-model="currentTab">
        <v-tab>Combiner</v-tab>
        <v-tab>Injector</v-tab>
      </v-tabs>
      <Combiner v-if="currentTab == 0" />
      <Injector v-else-if="currentTab == 1" />
    </v-main>
  </v-app>
</template>

<script>
import Combiner from './components/Combiner';
import Injector from './components/Injector';

export default {
  name: 'App',

  components: {
    Combiner,
    Injector
  },

  data: () => ({
    currentTab: 0
  }),
};
</script>
