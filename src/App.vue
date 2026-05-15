<template>
  <v-app>
    <v-app-bar
      color="primary"
    >
      <div class="d-flex align-center">
        <h3>ESE Grade Handler</h3>
      </div>

      <v-spacer></v-spacer>
      <v-btn color="error" @click="refresh">Reset</v-btn>
    </v-app-bar>

    <v-main>
      <v-tabs align-tabs="center" v-model="currentTab">
        <v-tab :value="0">Welcome</v-tab>
        <v-tab :value="1">Combine Results</v-tab>
        <v-tab :value="2">Prepare Official</v-tab>
        <v-tab :value="3">Prepare Attendance</v-tab>
        <v-tab :value="4">Grade Changes</v-tab>
        <!-- <v-tab :value="5">Signer</v-tab> -->
      </v-tabs>
      <Welcome v-if="currentTab == 0" />
      <Combiner v-else-if="currentTab == 1" />
      <Injector v-else-if="currentTab == 2" />
      <AttendanceInjector v-else-if="currentTab == 3" />
      <Mutator2 v-else-if="currentTab == 4" />
      <!-- <Signer v-else-if="currentTab == 2" /> -->
    </v-main>
  </v-app>
</template>

<script>
import Welcome from './components/Welcome';
import Combiner from './components/CombinerV2';
import Injector from './components/Injector2';
import Mutator2 from './components/Mutator2';
import AttendanceInjector from './components/AttendanceInjector.vue';
// import Signer from './components/Signer.vue';

export default {
  name: 'App',

  components: {
    Combiner,
    Injector,
    Welcome,
    Mutator2,
    AttendanceInjector,
    // Signer
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
