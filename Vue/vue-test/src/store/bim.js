import { defineStore } from "pinia"
import { ref, computed } from "vue"


export const useBimStore = defineStore('bim', () => {
    // state
    const isBim = ref(false)
    const clientId = ref("")
    const clientSecret = ref("")
    const layerUrl = ref("")
    const BeareraccessToken = ref("")

    // action
    const changeisBim = () => {
        isBim.value = !isBim.value
    }

     

    return {
        isBim,
        clientId,
        clientSecret,
        layerUrl,
        BeareraccessToken,
        changeisBim
    }
})