import { ref } from "vue";

export default defineBackground({
  // Set manifest options
  persistent: true,

  main() {
    console.log("Furlang, launch!")
  }
});
