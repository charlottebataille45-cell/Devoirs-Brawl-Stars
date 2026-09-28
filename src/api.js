/**
 * DataManager : Gestionnaire de données hybrides (Statique GitHub Pages + Dynamique Apps Script)
 */
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwSBdQHLeLF_sGy0dVq3gtFPHIm2saKyYb2DMTidzVCXPXIdVoI1LY87mC0U8M6HhKb/exec";
const REFERENTIELS_LOCAL_URL = "./data/referentiels.json";

class DataManager {
  constructor() {
    this.referentiels = null;
    this.devoirs = [];
    this.profils = [];
  }

  /**
   * Initialise les référentiels statiques depuis le fichier JSON avec mise en cache
   */
  async initReferentiels() {
    try {
      const cache = localStorage.getItem('referentiels_cache');
      if (cache) {
        this.referentiels = JSON.parse(cache);
      } else {
        const response = await fetch(REFERENTIELS_LOCAL_URL);
        if (!response.ok) throw new Error("Impossible de charger les référentiels statiques.");
        this.referentiels = await response.json();
        localStorage.setItem('referentiels_cache', JSON.stringify(this.referentiels));
      }
    } catch (err) {
      console.error("Erreur d'initialisation des référentiels :", err);
      // Fallback vide si erreur
      this.referentiels = { enfants: [], matieres: [], statuts: [], priorites: [], types: [], catalogue: [] };
    }
    return this.referentiels;
  }

  /**
   * Exécute une requête POST vers Google Apps Script
   */
  async callAPI(action, payload = {}) {
    const dataToSend = Object.assign({ action: action }, payload);
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(dataToSend)
    });

    if (!response.ok) {
      throw new Error(`Erreur réseau HTTP ${response.status}`);
    }

    const json = await response.json();
    if (!json.success) {
      throw new Error(json.error ? json.error.message : "Erreur inconnue de l'API");
    }

    return json.data;
  }

  // API Devoirs
  async fetchDevoirs() {
    this.devoirs = await this.callAPI('getDevoirsFamille');
    return this.devoirs;
  }

  async fetchProfils() {
    this.profils = await this.callAPI('getProfils');
    return this.profils;
  }

  async changerStatutDevoir(idDevoir, nouveauStatut) {
    return await this.callAPI('changerStatut', { idDevoir, nouveauStatut });
  }

  async ajouterDevoir(dataDevoir) {
    return await this.callAPI('ajouterDevoir', { data: dataDevoir });
  }

  async modifierDevoir(idDevoir, dataDevoir) {
    return await this.callAPI('modifierDevoir', { idDevoir, data: dataDevoir });
  }

  async supprimerDevoir(idDevoir) {
    return await this.callAPI('supprimerDevoir', { idDevoir });
  }

  // API Récompenses
  async acheterRecompense(idEnfant, idCatalogue) {
    return await this.callAPI('acheterRecompense', { idEnfant, idCatalogue });
  }

  async fetchRecompensesEnfant(idEnfant) {
    return await this.callAPI('getRecompensesEnfant', { idEnfant });
  }

  async utiliserRecompense(idEnfant, idRecompense) {
    return await this.callAPI('utiliserRecompense', { idEnfant, idRecompense });
  }
}

export const dataManager = new DataManager();
