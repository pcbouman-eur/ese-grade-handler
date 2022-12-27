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
      <v-btn color="error" @click="refresh">Reset</v-btn>
    </v-app-bar>

    <v-main>
      <v-tabs centered v-model="currentTab">
        <v-tab>Welcome</v-tab>
        <v-tab>Combiner</v-tab>
        <v-tab>Injector</v-tab>
        <v-tab>Mutator</v-tab>
        <v-tab>Signer</v-tab>
      </v-tabs>
      <Welcome v-if="currentTab == 0" />
      <Combiner v-else-if="currentTab == 1" />
      <Injector v-else-if="currentTab == 2" />
      <Mutator v-else-if="currentTab == 3" />
      <Signer v-else-if="currentTab == 4" />
    </v-main>
  </v-app>
</template>

<script>
import Welcome from './components/Welcome';
import Combiner from './components/CombinerV2';
import Injector from './components/Injector';
import Mutator from './components/Mutator';
import Signer from './components/Signer.vue';

export default {
  name: 'App',

  components: {
    Combiner,
    Injector,
    Welcome,
    Mutator,
    Signer
  },

  data: () => ({
    currentTab: 0
  }),
  methods: {
    refresh() {
      window.location.reload();
    }
  }
};
</script>
