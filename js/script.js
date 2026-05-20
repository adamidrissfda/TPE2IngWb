/**
 * ============================================================
 * TRAVAUX PRATIQUES INDIVIDUELS - UNIVERSITÉ DE NGAOUNDÉRÉ
 * Étudiant: KAMDEM FOKAM Arthur - Matricule: 24A546FS
 * Enseignant: Dr. KOTVA Samuel
 * TP: Calcul TVA 17% (Taux fixe) & Conversion Multi-Devises
 * ============================================================
 */

// ============================================================
// CONSTANTES
// ============================================================
const TAUX_TVA_FIXE = 17; // 17% fixe selon l'énoncé
const STORAGE_KEY = 'tp_universite_transactions_kotva';

// Taux de change (Base: 1 EUR = ...)
const TAUX_DEVISES = {
    // Afrique
    'XAF': { taux: 655.957, symbole: 'FCFA', nom: 'Franc CFA (BEAC)' },
    'XOF': { taux: 655.957, symbole: 'FCFA', nom: 'Franc CFA (BCEAO)' },
    'NGN': { taux: 1650.50, symbole: '₦', nom: 'Naira Nigérian' },
    'ZAR': { taux: 20.15, symbole: 'R', nom: 'Rand Sud-Africain' },
    'EGP': { taux: 52.30, symbole: 'E£', nom: 'Livre Égyptienne' },
    'MAD': { taux: 10.95, symbole: 'MAD', nom: 'Dirham Marocain' },
    // Amériques
    'USD': { taux: 1.085, symbole: '$', nom: 'Dollar Américain' },
    'CAD': { taux: 1.475, symbole: 'C$', nom: 'Dollar Canadien' },
    'BRL': { taux: 5.85, symbole: 'R$', nom: 'Real Brésilien' },
    // Asie
    'CNY': { taux: 7.823, symbole: '¥', nom: 'Yuan Chinois' },
    'JPY': { taux: 161.23, symbole: '¥', nom: 'Yen Japonais' },
    'INR': { taux: 90.45, symbole: '₹', nom: 'Roupie Indienne' },
    'KRW': { taux: 1485.30, symbole: '₩', nom: 'Won Sud-Coréen' },
    // Europe
    'EUR': { taux: 1.000, symbole: '€', nom: 'Euro' },
    'GBP': { taux: 0.857, symbole: '£', nom: 'Livre Sterling' },
    'CHF': { taux: 0.952, symbole: 'CHF', nom: 'Franc Suisse' },
    'RUB': { taux: 98.30, symbole: '₽', nom: 'Rouble Russe' },
    // Moyen-Orient
    'AED': { taux: 3.985, symbole: 'AED', nom: 'Dirham des Émirats' },
    'SAR': { taux: 4.07, symbole: 'SAR', nom: 'Riyal Saoudien' }
};

// ============================================================
// INITIALISATION UI
// ============================================================
const rangeSlider = document.getElementById('rangeSlider');
const rangeOutput = document.getElementById('rangeValue');

if (rangeSlider && rangeOutput) {
    const updateRange = () => {
        rangeOutput.textContent = rangeSlider.value + '%';
        const val = (rangeSlider.value - rangeSlider.min) / (rangeSlider.max - rangeSlider.min) * 100;
        rangeSlider.style.background = `linear-gradient(90deg, #cc9900 ${val}%, rgba(255,255,255,0.2) ${val}%)`;
    };
    rangeSlider.addEventListener('input', updateRange);
    updateRange();
}

// ============================================================
// GESTION DU STOCKAGE LOCAL
// ============================================================
function getTransactions() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveTransaction(transaction) {
    const transactions = getTransactions();
    transactions.push(transaction);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    mettreAJourCompteur();
}

function effacerHistorique() {
    if (confirm('Voulez-vous vraiment effacer tout l\'historique ?')) {
        localStorage.removeItem(STORAGE_KEY);
        mettreAJourCompteur();
        document.getElementById('historiqueContainer').classList.add('hidden');
        alert('✅ Historique effacé avec succès');
    }
}

function mettreAJourCompteur() {
    const transactions = getTransactions();
    document.getElementById('compteurEnregistrements').textContent = 
        `${transactions.length} enregistrement(s)`;
}

// ============================================================
// MISE À JOUR RÉDUCTION ET TYPE UTILISATEUR
// ============================================================
function mettreAJourReduction() {
    const typeUtilisateur = document.querySelector('input[name="typeUtilisateur"]:checked').value;
    const reductionInput = document.getElementById('reduction');
    const typeReductionSpan = document.getElementById('typeReduction');
    
    const reductions = {
        'etudiant': { valeur: 10, texte: 'Étudiant' },
        'enseignant': { valeur: 15, texte: 'Enseignant' },
        'personnel': { valeur: 5, texte: 'Personnel' }
    };
    
    const reduction = reductions[typeUtilisateur] || { valeur: 0, texte: 'Aucune' };
    reductionInput.value = reduction.valeur;
    typeReductionSpan.textContent = `Réduction ${reduction.texte}: ${reduction.valeur}%`;
    
    calculerTVA();
}

// ============================================================
// CHANGEMENT DE DEVISE
// ============================================================
function changerDevise() {
    const devise = document.getElementById('deviseSelect').value;
    const deviseInfo = TAUX_DEVISES[devise];
    
    // Mise à jour de l'affichage du taux
    document.getElementById('tauxActuel').innerHTML = 
        `Taux: 1 EUR = ${deviseInfo.taux.toFixed(3)} ${deviseInfo.symbole} (${deviseInfo.nom})`;
    
    calculerTVA();
}

// ============================================================
// CALCUL TVA 17% (TAUX FIXE) AVEC CONVERSION DEVISES
// ============================================================
function calculerTVA() {
    const prixHT = parseFloat(document.getElementById('prixHT').value) || 0;
    const reduction = parseFloat(document.getElementById('reduction').value) || 0;
    const devise = document.getElementById('deviseSelect').value;
    const deviseInfo = TAUX_DEVISES[devise];
    
    // Calcul avec TVA fixe 17%
    const montantTVA = prixHT * (TAUX_TVA_FIXE / 100);
    const prixTTC = prixHT + montantTVA;
    const montantReduction = prixTTC * (reduction / 100);
    const prixFinalXAF = prixTTC - montantReduction;
    
    // Conversion vers la devise choisie
    const prixFinalDevise = prixFinalXAF / deviseInfo.taux;
    
    // Formatage FCFA
    const formatterFCFA = (montant) => {
        return Math.round(montant).toLocaleString('fr-FR') + ' FCFA';
    };
    
    // Formatage devise
    const formatterDevise = (montant) => {
        if (['XAF', 'XOF', 'NGN', 'JPY', 'INR', 'KRW'].includes(devise)) {
            return Math.round(montant).toLocaleString('fr-FR');
        } else {
            return montant.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    };
    
    // Mise à jour affichage
    document.getElementById('montantTVA').innerHTML = 
        `<i class="fas fa-calculator"></i> Montant TVA (${TAUX_TVA_FIXE}%): <strong>${formatterFCFA(montantTVA)}</strong>`;
    
    document.getElementById('prixTTC').innerHTML = 
        `<i class="fas fa-tag"></i> Prix TTC: <strong>${formatterFCFA(prixTTC)}</strong>`;
    
    document.getElementById('montantReduction').innerHTML = 
        `<i class="fas fa-tags"></i> Réduction (${reduction}%): <strong>-${formatterFCFA(montantReduction)}</strong>`;
    
    document.getElementById('prixFinal').innerHTML = 
        `<i class="fas fa-check-circle"></i> Prix final après réduction: <strong>${formatterFCFA(prixFinalXAF)}</strong>`;
    
    // Affichage dans la devise choisie
    const deviseFormate = formatterDevise(prixFinalDevise);
    document.getElementById('prixFinalDevise').innerHTML = 
        `<i class="fas fa-exchange-alt"></i> Prix final en ${devise}: <strong>${deviseFormate} ${deviseInfo.symbole}</strong>`;
    
    return { prixHT, montantTVA, prixTTC, montantReduction, reduction, prixFinalXAF, prixFinalDevise, devise, deviseInfo };
}

// ============================================================
// ENREGISTREMENT TRANSACTION
// ============================================================
function enregistrerTransaction() {
    // Validation des champs obligatoires
    const nom = document.getElementById('nom').value.trim();
    const prenom = document.getElementById('prenom').value.trim();
    const telephone = document.getElementById('telephone').value.trim();
    const email = document.getElementById('email').value.trim();
    
    if (!nom || !prenom || !telephone || !email) {
        alert('❌ Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('❌ Format d\'email invalide');
        return;
    }
    
    if (!/^[0-9]{9,15}$/.test(telephone.replace(/\s/g, ''))) {
        alert('❌ Le téléphone doit contenir entre 9 et 15 chiffres');
        return;
    }
    
    const typeUtilisateur = document.querySelector('input[name="typeUtilisateur"]:checked');
    const typeUtilisateurTexte = typeUtilisateur ? 
        typeUtilisateur.parentElement.querySelector('strong').textContent : 'Étudiant';
    
    const calculs = calculerTVA();
    
    const transaction = {
        id: Date.now(),
        date: new Date().toLocaleString('fr-FR'),
        enseignant: 'Dr. KOTVA Samuel',
        utilisateur: {
            nom, prenom, telephone, email,
            type: typeUtilisateurTexte
        },
        calcul: {
            prixHT: calculs.prixHT,
            tauxTVA: TAUX_TVA_FIXE,
            montantTVA: calculs.montantTVA,
            prixTTC: calculs.prixTTC,
            reduction: calculs.reduction,
            montantReduction: calculs.montantReduction,
            prixFinalXAF: calculs.prixFinalXAF,
            devise: calculs.devise,
            prixFinalDevise: calculs.prixFinalDevise,
            symboleDevise: calculs.deviseInfo.symbole
        }
    };
    
    saveTransaction(transaction);
    
    alert(`✅ Transaction enregistrée avec succès !\n\n` +
          `Client: ${prenom} ${nom} (${typeUtilisateurTexte})\n` +
          `Total payé: ${Math.round(calculs.prixFinalXAF).toLocaleString('fr-FR')} FCFA\n` +
          `(${calculs.prixFinalDevise.toFixed(2)} ${calculs.deviseInfo.symbole})\n\n` +
          `TP encadré par: Dr. KOTVA Samuel`);
}

// ============================================================
// AFFICHAGE HISTORIQUE
// ============================================================
function afficherHistorique() {
    const container = document.getElementById('historiqueContainer');
    const listeDiv = document.getElementById('listeHistorique');
    const transactions = getTransactions();
    
    if (transactions.length === 0) {
        listeDiv.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center;">Aucun enregistrement</p>';
    } else {
        listeDiv.innerHTML = transactions.slice(-10).reverse().map(t => `
            <div class="historique-item">
                <div>
                    <strong>${t.utilisateur.prenom} ${t.utilisateur.nom}</strong> 
                    <span style="color: #cc9900;">(${t.utilisateur.type})</span><br>
                    <small>${t.date}</small><br>
                    <small>📞 ${t.utilisateur.telephone} | ✉️ ${t.utilisateur.email}</small><br>
                    <small style="color: #cc9900;">👨‍🏫 ${t.enseignant}</small>
                </div>
                <div style="text-align: right;">
                    <strong>${Math.round(t.calcul.prixFinalXAF).toLocaleString('fr-FR')} FCFA</strong><br>
                    <small>${t.calcul.prixFinalDevise.toFixed(2)} ${t.calcul.symboleDevise}</small><br>
                    <small>Réduction: ${t.calcul.reduction}%</small>
                </div>
            </div>
        `).join('');
    }
    
    container.classList.remove('hidden');
}

// ============================================================
// FONCTIONS ALGORITHMIQUES
// ============================================================
function verifierPresence() {
    const monTableau = [10, 25, 42, 50, 88, 100];
    const inputNombre = document.getElementById('nombreCherche');
    const affichage = document.getElementById('resultatArray');
    
    const nombre = parseInt(inputNombre.value, 10);
    
    if (isNaN(nombre)) {
        affichage.innerHTML = `<i class="fas fa-info-circle"></i> <span>Entrez un nombre valide</span>`;
        return false;
    }
    
    const existe = monTableau.includes(nombre);
    const couleur = existe ? '#10b981' : '#ef4444';
    const icone = existe ? 'check-circle' : 'times-circle';
    
    affichage.innerHTML = `<i class="fas fa-${icone}" style="color: ${couleur};"></i> 
                           <span><strong>${existe}</strong> — ${nombre} ${existe ? 'est' : 'n\'est pas'} dans [${monTableau.join(', ')}]</span>`;
    affichage.style.borderLeftColor = couleur;
    
    return existe;
}

function afficherDateJour() {
    const affichage = document.getElementById('dateAujourdhui');
    const date = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    affichage.innerHTML = `<i class="far fa-calendar-check" style="color: #cc9900;"></i> 
                           <span>${date.toLocaleDateString('fr-FR', options)}</span>`;
}

// ============================================================
// INITIALISATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    mettreAJourReduction();
    changerDevise();
    mettreAJourCompteur();
    
    console.log('%c[TP-UN] Calcul TVA 17% - Multi-Devises', 'color: #cc9900; font-weight: bold;');
    console.log('✅ TVA fixe: 17%');
    console.log('✅ Devises: CFA, USD, EUR, CNY, GBP, etc.');
    console.log('✅ Types utilisateurs avec réductions');
    console.log('✅ Enseignant: Dr. KOTVA Samuel');
});

document.getElementById('formulairePrincipal').addEventListener('submit', (e) => {
    e.preventDefault();
    enregistrerTransaction();
});