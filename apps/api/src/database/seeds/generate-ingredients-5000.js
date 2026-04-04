const { Client } = require('pg');

const DB_URL = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// ============================================================
// CATEGORY 1: Humectants/Moisturizers (~150)
// ============================================================
const humectants = [
  'Sorbitol','Propylene Glycol','PEG-4','PEG-6','PEG-8','PEG-12','PEG-20','PEG-32','PEG-40','PEG-75',
  'Pentylene Glycol','Hexylene Glycol','1,2-Hexanediol','Dipropylene Glycol','Saccharide Isomerate',
  'Xylitol','Mannitol','Erythritol','Maltitol','Sodium Lactate',
  'Sodium PCA','Propanediol','Caprylyl Glycol','Ethylhexylglycerin','Methyl Gluceth-20',
  'PPG-3 Myristyl Ether','Polyglyceryl-3 Methylglucose Distearate','Glycereth-26','Glycereth-7',
  'PEG-7 Glyceryl Cocoate','PEG-40 Hydrogenated Castor Oil','PEG-60 Hydrogenated Castor Oil',
  'Hydrogenated Starch Hydrolysate','Maltodextrin','Inositol','Fructose','Glucose','Sucrose',
  'Raffinose','Rhamnose','Fucose','Galactose','Mannose','Xylose','Arabinose','Ribose',
  'Trehalose','Glucuronic Acid','N-Acetyl Glucosamine','Polyglutamic Acid',
  'Hyaluronic Acid Crosspolymer','Hydrolyzed Hyaluronic Acid','Acetyl Hyaluronic Acid',
  'Sodium Acetylated Hyaluronate','Potassium Hyaluronate','Hydroxypropyltrimonium Hyaluronate',
  'Sodium Hyaluronate Crosspolymer','Glycosaminoglycans','Chondroitin Sulfate',
  'Alginate','Sodium Alginate','Calcium Alginate','Algin',
  'PCA','DL-Panthenol','Dexpanthenol','Panthenyl Ethyl Ether','Pantolactone',
  'Tamarindus Indica Seed Polysaccharide','Tremella Fuciformis Sporocarp Extract',
  'Imperata Cylindrica Root Extract','Laminaria Digitata Extract','Fucus Vesiculosus Extract',
  'Caesalpinia Spinosa Gum','Sclerotium Gum','Pullulan','Curdlan',
  'Butylene Glycol Dicaprylate/Dicaprate','Methylpropanediol',
  'PEG-150 Distearate','PEG-100 Stearate','PEG-20 Stearate',
  'Lactitol','Isomalt','Leuconostoc/Radish Root Ferment Filtrate',
  'Diglycerin','Triethylene Glycol','Tetrahydroxypropyl Ethylenediamine',
  'PPG-5-Ceteth-20','PEG-6 Caprylic/Capric Glycerides',
  'Hydroxyethyl Urea','Sodium Isethionate','Sodium Methyl Cocoyl Taurate',
  'PEG-10 Dimethicone','PEG-12 Dimethicone',
  'Polymethylsilsesquioxane','Glyceryl Polyacrylate','Sodium Polyacrylate',
  'Pentaerythrityl Tetraethylhexanoate','Bis-PEG-18 Methyl Ether Dimethyl Silane',
  'PPG-1-PEG-9 Lauryl Glycol Ether','Methyl Glucoside','Polyquaternium-51',
  'Lipidure-PMB','Phosphorylcholine Glycol Acrylate Polymer',
  'Hydroxypropyl Cyclodextrin','Beta-Cyclodextrin','Gamma-Cyclodextrin',
  'Polydextrose','Dextran','Levan','Carageenan','Fucoidan',
  'Lentinus Edodes Extract','Ganoderma Lucidum Extract','Cordyceps Sinensis Extract',
  'Agaricus Blazei Extract','Inonotus Obliquus Extract',
  'PPG-3 Benzyl Ether Myristate','Pentaerythrityl Tetracaprylate/Tetracaprate',
  'PEG-5 Glyceryl Stearate','PEG-30 Glyceryl Stearate','PPG-15 Stearyl Ether',
  'Sodium Carboxymethyl Beta-Glucan','Acetamidoethoxyethanol',
  'PEG-45/Dodecyl Glycol Copolymer','Glyceryl Glucoside',
  'Aquaxyl','Homarine HCL','Hydroxypropyl Bispalmitamide MEA',
  'Hexapeptide-9','Bis-Ethoxydiglycol Cyclohexane 1,4-Dicarboxylate',
  'Polyacrylate Crosspolymer-6','Ammonium Polyacryloyldimethyl Taurate',
  'PPG-10 Methyl Glucose Ether','Methyl Glucose Sesquistearate',
  'PEG-20 Methyl Glucose Sesquistearate','Tricaprylin','Triethylhexanoin',
  'Diisostearyl Malate','C12-15 Alkyl Benzoate','Octyldodecanol',
  'Decyl Oleate','Dibutyl Adipate','PPG-14 Butyl Ether','PPG-26-Buteth-26',
  'Hydrogenated Polyisobutene','Isododecane','Isohexadecane',
  'Undecane','Tridecane','C13-14 Isoparaffin','C15-19 Alkane',
  'Hydrogenated Polydecene','Squalene','Pentaerythrityl Tetraisostearate'
].map(n => ({
  inci_name: n, ingredient_group: 'Humectant', origin_type: 'synthetic',
  function_summary: 'Nemlendirici; cildin su tutma kapasitesini artırır ve nem bariyerini destekler.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 2: Emollients/Oils (~400)
// ============================================================
const emollients = [
  'Caprylic/Capric Triglyceride','Isopropyl Myristate','Isopropyl Palmitate','Isopropyl Isostearate',
  'Cetyl Alcohol','Cetearyl Alcohol','Stearyl Alcohol','Behenyl Alcohol','Myristyl Alcohol','Lauryl Alcohol',
  'Stearic Acid','Oleic Acid','Linoleic Acid','Linolenic Acid','Palmitic Acid','Myristic Acid','Lauric Acid','Arachidic Acid','Behenic Acid','Erucic Acid',
  'Evening Primrose Oil','Rosehip Seed Oil','Argan Oil','Marula Oil','Baobab Oil','Moringa Oil','Tamanu Oil',
  'Hemp Seed Oil','Grapeseed Oil','Sweet Almond Oil','Avocado Oil','Macadamia Nut Oil','Hazelnut Oil',
  'Sunflower Seed Oil','Safflower Oil','Sesame Seed Oil','Olive Oil','Coconut Oil','Palm Oil','Palm Kernel Oil',
  'Castor Oil','Meadowfoam Seed Oil','Perilla Ocymoides Seed Oil','Borage Seed Oil',
  'Kukui Nut Oil','Passion Fruit Seed Oil','Pracaxi Oil','Buriti Oil','Pequi Oil','Tucuma Butter',
  'Mango Seed Butter','Cocoa Butter','Shea Butter','Sal Butter','Illipe Butter','Kokum Butter','Cupuacu Butter',
  'Mowrah Butter','Murumuru Butter','Bacuri Butter','Ucuuba Butter',
  'Beeswax','Candelilla Wax','Carnauba Wax','Rice Bran Wax','Sunflower Seed Wax','Jojoba Esters',
  'Soy Wax','Microcrystalline Wax','Ozokerite','Ceresin','Paraffin',
  'Petrolatum','Mineral Oil','Lanolin','Lanolin Alcohol','Lanolin Oil','Laneth-5',
  'Cetyl Palmitate','Cetyl Esters','Glyceryl Behenate','Glyceryl Stearate','Glyceryl Oleate',
  'Glyceryl Laurate','Glyceryl Caprylate','Glyceryl Caprate','Glyceryl Undecylenate',
  'Glyceryl Stearate SE','Glyceryl Stearate Citrate','Glyceryl Dibehenate',
  'Sorbitan Stearate','Sorbitan Oleate','Sorbitan Palmitate','Sorbitan Laurate',
  'Sorbitan Tristearate','Sorbitan Trioleate','Sorbitan Sesquioleate',
  'Myristyl Myristate','Octyldodecyl Stearoyl Stearate','Cetearyl Isononanoate',
  'Coco-Caprylate','Coco-Caprylate/Caprate','Cetearyl Ethylhexanoate',
  'Ethylhexyl Palmitate','Ethylhexyl Stearate','Decyl Cocoate',
  'Helianthus Annuus Seed Oil','Olea Europaea Fruit Oil','Persea Gratissima Oil',
  'Prunus Amygdalus Dulcis Oil','Prunus Armeniaca Kernel Oil','Prunus Avium Seed Oil',
  'Prunus Domestica Seed Oil','Prunus Cerasus Seed Oil',
  'Vitis Vinifera Seed Oil','Corylus Avellana Nut Oil','Bertholletia Excelsa Seed Oil',
  'Cocos Nucifera Oil','Elaeis Guineensis Oil','Butyrospermum Parkii Butter',
  'Theobroma Cacao Seed Butter','Mangifera Indica Seed Butter','Argania Spinosa Kernel Oil',
  'Simmondsia Chinensis Seed Oil','Ricinus Communis Seed Oil','Sesamum Indicum Seed Oil',
  'Oenothera Biennis Oil','Rosa Canina Seed Oil','Limnanthes Alba Seed Oil',
  'Cannabis Sativa Seed Oil','Linum Usitatissimum Seed Oil','Camelina Sativa Seed Oil',
  'Crambe Abyssinica Seed Oil','Brassica Campestris Seed Oil','Carthamus Tinctorius Seed Oil',
  'Gossypium Herbaceum Seed Oil','Arachis Hypogaea Oil','Zea Mays Oil',
  'Oryza Sativa Bran Oil','Triticum Vulgare Germ Oil','Hordeum Vulgare Seed Oil',
  'Avena Sativa Kernel Oil','Secale Cereale Seed Oil',
  'Sclerocarya Birrea Seed Oil','Adansonia Digitata Seed Oil','Moringa Oleifera Seed Oil',
  'Calophyllum Inophyllum Seed Oil','Aleurites Moluccanus Seed Oil',
  'Passiflora Edulis Seed Oil','Pentaclethra Macroloba Seed Oil',
  'Mauritia Flexuosa Fruit Oil','Caryocar Brasiliense Fruit Oil',
  'Astrocaryum Murumuru Seed Butter','Astrocaryum Vulgare Fruit Oil',
  'Orbignya Oleifera Seed Oil','Virola Sebifera Nut Butter',
  'Calodendrum Capense Seed Oil','Citrullus Lanatus Seed Oil',
  'Cucurbita Pepo Seed Oil','Trichilia Emetica Seed Butter',
  'Shorea Robusta Seed Butter','Garcinia Indica Seed Butter',
  'Madhuca Longifolia Seed Butter','Irvingia Gabonensis Kernel Butter',
  'Vitellaria Paradoxa Butter','Cera Alba','Copernicia Cerifera Wax',
  'Euphorbia Cerifera Wax','Simmondsia Chinensis Wax',
  'Rhus Succedanea Fruit Wax','Acacia Decurrens/Jojoba/Sunflower Seed Wax Polyglyceryl-3 Esters',
  'Hydrogenated Jojoba Oil','Hydrogenated Olive Oil','Hydrogenated Coconut Oil',
  'Hydrogenated Castor Oil','Hydrogenated Soybean Oil','Hydrogenated Palm Oil',
  'Hydrogenated Vegetable Oil','Hydrogenated Cottonseed Oil',
  'Myristyl Lactate','Cetyl Lactate','Isocetyl Stearate','Isocetyl Palmitate',
  'Octyldodecyl Myristate','Octyldodecyl Oleate','Tridecyl Neopentanoate',
  'Tridecyl Stearate','Tridecyl Trimellitate','Neopentyl Glycol Diethylhexanoate',
  'Neopentyl Glycol Dicaprylate/Dicaprate','Diisostearyl Dimer Dilinoleate',
  'Dimer Dilinoleyl Dimer Dilinoleate','Polyglyceryl-2 Diisostearate',
  'Polyglyceryl-3 Diisostearate','Polyglyceryl-4 Diisostearate',
  'Polyglyceryl-6 Distearate','Polyglyceryl-10 Dipalmitate',
  'C10-18 Triglycerides','Medium-Chain Triglycerides','Tripalmitin','Tristearin','Triolein','Trilaurin',
  'Trimyristin','Trilinolein','Trilinolenin','Tricaprylin','Tricaprin',
  'Glyceryl Triacetyl Hydroxystearate','Glyceryl Triacetyl Ricinoleate',
  'Tribehenin','Triisononanoin','Triisostearyl Citrate',
  'PPG-3 Myristyl Ether','PPG-5-Laureth-5','PPG-2 Myristyl Ether Propionate',
  'Diethylhexyl Succinate','Diethylhexyl Carbonate','Dicaprylyl Carbonate',
  'Dicaprylyl Ether','Diisopropyl Adipate','Diisopropyl Sebacate',
  'Diisostearyl Fumarate','Diheptyl Succinate','Di-C12-13 Alkyl Malate',
  'Cetyl Ricinoleate','Propylene Glycol Dicaprylate/Dicaprate',
  'Propylene Glycol Isostearate','Propylene Glycol Dioctanoate',
  'PPG-15 Stearyl Ether Benzoate','Stearyl Heptanoate','Stearyl Caprylate',
  'Decyl Isostearate','Isodecyl Neopentanoate','Isodecyl Oleate',
  'Isotridecyl Isononanoate','Pentaerythrityl Tetraethylhexanoate',
  'Pentaerythrityl Tetrastearate','Pentaerythrityl Tetraoleate',
  'Neopentyl Glycol Diisostearate','Trimethylolpropane Triisostearate',
  'Bis-Diglyceryl Polyacyladipate-2','Polyglyceryl-2 Triisostearate',
  'Polyglyceryl-4 Isostearate','Polyglyceryl-3 Oleate',
  'Polyglyceryl-6 Polyricinoleate','Polyglyceryl-10 Oleate',
  'Dihydroxysqualene','Phytosteryl Macadamiate','Phytosteryl Canolate',
  'Phytosteryl Isostearyl Dimer Dilinoleate','Phytosteryl/Octyldodecyl Lauroyl Glutamate',
  'Cholesteryl Hydroxystearate','Cholesteryl Isostearate','Cholesteryl Oleate',
  'Tocopheryl Linoleate','Tocopheryl Acetate Linoleate','Retinyl Linoleate',
  'Ascorbyl Palmitate','Ascorbyl Dipalmitate','Ascorbyl Stearate',
  'Crambe Abyssinica Seed Oil/Hydrogenated Crambe Abyssinica Seed Oil',
  'Tsubaki Oil','Plukenetia Volubilis Seed Oil','Echium Plantagineum Seed Oil',
  'Nigella Sativa Seed Oil','Lepidium Meyenii Root Oil','Opuntia Ficus-Indica Seed Oil',
  'Punica Granatum Seed Oil','Hippophae Rhamnoides Fruit Oil','Vaccinium Macrocarpon Seed Oil',
  'Rubus Idaeus Seed Oil','Rubus Chamaemorus Seed Oil','Actinidia Chinensis Seed Oil',
  'Prunus Persica Kernel Oil','Juglans Regia Seed Oil','Pistacia Vera Seed Oil',
  'Anacardium Occidentale Nut Oil','Helianthus Annuus Seed Oil Unsaponifiables',
  'Olea Europaea Fruit Oil Unsaponifiables','Glycine Soja Oil','Glycine Soja Oil Unsaponifiables',
  'Brassica Napus Seed Oil','Camellia Japonica Seed Oil','Camellia Oleifera Seed Oil',
  'Sapindus Mukorossi Fruit Extract','Sapindus Trifoliatus Fruit Extract',
  'Terminalia Ferdinandiana Fruit Oil','Kunzea Pomifera Fruit Oil',
  'Santalum Acuminatum Kernel Oil','Macadamia Integrifolia Seed Oil',
  'Persea Gratissima Oil Unsaponifiables','Butyrospermum Parkii Butter Unsaponifiables',
  'Olea Europaea Leaf Extract','Olea Europaea Flower Extract',
  'Isostearyl Neopentanoate','Isostearyl Isostearate','Isostearyl Palmitate',
  'Myristyl Eicosanoate','Stearyl Stearate','Behenyl Behenate',
  'Arachidyl Alcohol','Arachidyl Behenate','Arachidyl Glucoside',
  'C20-40 Alkyl Stearate','C20-40 Alcohols','C14-22 Alcohols',
  'C12-20 Alkyl Glucoside','C12-15 Alkyl Lactate','C12-13 Alkyl Lactate',
  'Hydrogenated Ethylhexyl Olivate','Hydrogenated Olive Oil Unsaponifiables',
  'Olea Europaea Oil Unsaponifiables','Phytosqualane','Hemisqualane',
  'Isoamyl Cocoate','Isoamyl Laurate','Coco-Caprylate/Caprate',
  'Undecylenoyl Glycine','Myristoyl/Palmitoyl Oxostearamide/Arachamide MEA',
  'Dipalmitoylethyl Hydroxyethylmonium Methosulfate',
  'Behentrimonium Chloride','Cetrimonium Chloride','Stearamidopropyl Dimethylamine'
].map(n => ({
  inci_name: n, ingredient_group: 'Emollient', origin_type: 'natural',
  function_summary: 'Yumuşatıcı/yağ; cildi yumuşatır, pürüzsüzleştirir ve nem kaybını önler.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 3: Plant Extracts (~800)
// ============================================================
const plantExtracts = [
  'Camellia Sinensis Leaf Extract','Rosa Damascena Flower Water','Aloe Barbadensis Leaf Juice',
  'Calendula Officinalis Flower Extract','Matricaria Chamomilla Flower Extract',
  'Lavandula Angustifolia Flower Extract','Hamamelis Virginiana Leaf Extract',
  'Arnica Montana Flower Extract','Echinacea Purpurea Extract','Ginkgo Biloba Leaf Extract',
  'Panax Ginseng Root Extract','Curcuma Longa Root Extract','Zingiber Officinale Root Extract',
  'Glycyrrhiza Glabra Root Extract','Centella Asiatica Leaf Extract',
  'Rosmarinus Officinalis Leaf Extract','Salvia Officinalis Leaf Extract',
  'Thymus Vulgaris Flower/Leaf Extract','Mentha Piperita Leaf Extract',
  'Ocimum Basilicum Leaf Extract','Origanum Vulgare Leaf Extract',
  'Cinnamomum Zeylanicum Bark Extract','Syzygium Aromaticum Flower Extract',
  'Vanilla Planifolia Fruit Extract','Theobroma Cacao Extract',
  'Coffea Arabica Seed Extract','Coffea Robusta Seed Extract',
  'Camellia Sinensis Seed Extract','Vitis Vinifera Seed Extract','Vitis Vinifera Leaf Extract',
  'Punica Granatum Fruit Extract','Vaccinium Myrtillus Fruit Extract',
  'Vaccinium Angustifolium Fruit Extract','Vaccinium Macrocarpon Fruit Extract',
  'Rubus Idaeus Fruit Extract','Fragaria Vesca Fruit Extract','Morus Alba Root Extract',
  'Morus Bombycis Root Extract','Morus Nigra Fruit Extract',
  'Citrus Aurantium Dulcis Peel Extract','Citrus Limon Peel Extract',
  'Citrus Paradisi Fruit Extract','Citrus Reticulata Peel Extract',
  'Citrus Aurantium Amara Flower Extract','Citrus Grandis Peel Extract',
  'Citrus Junos Fruit Extract','Citrus Medica Limonum Fruit Extract',
  'Rosa Centifolia Flower Extract','Rosa Canina Fruit Extract','Rosa Gallica Flower Extract',
  'Rosa Rugosa Flower Extract','Rosa Moschata Seed Oil','Rosa Alba Flower Extract',
  'Jasminum Officinale Flower Extract','Jasminum Sambac Flower Extract',
  'Nelumbo Nucifera Flower Extract','Nymphaea Caerulea Flower Extract',
  'Paeonia Lactiflora Root Extract','Paeonia Suffruticosa Root Extract',
  'Chrysanthemum Indicum Flower Extract','Chrysanthemum Morifolium Flower Extract',
  'Helianthus Annuus Seed Extract','Taraxacum Officinale Extract',
  'Achillea Millefolium Extract','Hypericum Perforatum Extract',
  'Plantago Major Leaf Extract','Plantago Lanceolata Leaf Extract',
  'Urtica Dioica Extract','Sambucus Nigra Flower Extract',
  'Tilia Cordata Flower Extract','Tilia Tomentosa Bud Extract',
  'Betula Alba Bark Extract','Betula Pendula Leaf Extract',
  'Salix Alba Bark Extract','Salix Nigra Bark Extract',
  'Quercus Robur Bark Extract','Quercus Alba Bark Extract',
  'Ulmus Campestris Bark Extract','Fraxinus Excelsior Bark Extract',
  'Aesculus Hippocastanum Seed Extract','Castanea Sativa Seed Extract',
  'Crataegus Monogyna Fruit Extract','Crataegus Oxyacantha Extract',
  'Sorbus Aucuparia Fruit Extract','Malus Domestica Fruit Cell Culture Extract',
  'Pyrus Malus Fruit Extract','Pyrus Communis Fruit Extract',
  'Prunus Persica Fruit Extract','Prunus Avium Fruit Extract',
  'Prunus Mume Fruit Extract','Prunus Serrulata Flower Extract',
  'Ficus Carica Fruit Extract','Actinidia Chinensis Fruit Extract',
  'Carica Papaya Fruit Extract','Mangifera Indica Fruit Extract',
  'Ananas Sativus Fruit Extract','Musa Sapientum Fruit Extract',
  'Persea Americana Fruit Extract','Cocos Nucifera Fruit Extract',
  'Phoenix Dactylifera Fruit Extract','Tamarindus Indica Seed Extract',
  'Morinda Citrifolia Fruit Extract','Psidium Guajava Fruit Extract',
  'Litchi Chinensis Fruit Extract','Nephelium Lappaceum Peel Extract',
  'Garcinia Mangostana Peel Extract','Durio Zibethinus Fruit Extract',
  'Annona Squamosa Fruit Extract','Annona Muricata Leaf Extract',
  'Passiflora Incarnata Flower Extract','Passiflora Edulis Fruit Extract',
  'Opuntia Ficus-Indica Extract','Opuntia Streptacantha Stem Extract',
  'Aloe Barbadensis Leaf Extract','Aloe Ferox Leaf Extract',
  'Agave Americana Leaf Extract','Yucca Schidigera Extract',
  'Bambusa Vulgaris Extract','Equisetum Arvense Extract',
  'Ganoderma Lucidum Extract','Lentinus Edodes Extract','Cordyceps Sinensis Extract',
  'Trametes Versicolor Extract','Inonotus Obliquus Extract','Agaricus Blazei Extract',
  'Hericium Erinaceus Extract','Pleurotus Ostreatus Extract',
  'Auricularia Auricula Extract','Schizophyllum Commune Extract',
  'Tremella Fuciformis Extract','Poria Cocos Extract',
  'Astragalus Membranaceus Root Extract','Atractylodes Macrocephala Root Extract',
  'Bupleurum Falcatum Root Extract','Codonopsis Pilosula Root Extract',
  'Angelica Sinensis Root Extract','Angelica Archangelica Root Extract',
  'Angelica Gigas Root Extract','Angelica Dahurica Root Extract',
  'Ligusticum Chuanxiong Root Extract','Rehmannia Glutinosa Root Extract',
  'Paeonia Lactiflora Root Extract','Scutellaria Baicalensis Root Extract',
  'Coptis Japonica Root Extract','Phellodendron Amurense Bark Extract',
  'Sophora Flavescens Root Extract','Sophora Japonica Flower Extract',
  'Lonicera Japonica Flower Extract','Lonicera Caprifolium Flower Extract',
  'Forsythia Suspensa Fruit Extract','Gardenia Jasminoides Fruit Extract',
  'Lycium Barbarum Fruit Extract','Lycium Chinense Fruit Extract',
  'Schisandra Chinensis Fruit Extract','Ziziphus Jujuba Fruit Extract',
  'Melia Azadirachta Leaf Extract','Azadirachta Indica Leaf Extract',
  'Moringa Oleifera Leaf Extract','Moringa Oleifera Seed Extract',
  'Barosma Betulina Leaf Extract','Rooibos Extract',
  'Aspalathus Linearis Extract','Cyclopia Intermedia Extract',
  'Pelargonium Graveolens Extract','Pelargonium Sidoides Root Extract',
  'Sutherlandia Frutescens Extract','Hoodia Gordonii Extract',
  'Ximenia Americana Seed Oil','Kigelia Africana Fruit Extract',
  'Adansonia Digitata Fruit Extract','Balanites Aegyptiaca Oil',
  'Hibiscus Sabdariffa Flower Extract','Hibiscus Rosa-Sinensis Flower Extract',
  'Lawsonia Inermis Leaf Extract','Commiphora Myrrha Extract',
  'Boswellia Serrata Extract','Boswellia Carterii Extract',
  'Aquilaria Agallocha Extract','Santalum Album Extract',
  'Cedrus Atlantica Bark Extract','Cedrus Deodara Wood Extract',
  'Cupressus Sempervirens Extract','Juniperus Communis Fruit Extract',
  'Pinus Sylvestris Bark Extract','Pinus Pinaster Bark Extract',
  'Picea Abies Extract','Abies Sibirica Oil',
  'Eucalyptus Globulus Leaf Extract','Melaleuca Alternifolia Leaf Extract',
  'Leptospermum Scoparium Extract','Kunzea Ericoides Extract',
  'Syzygium Aromaticum Bud Extract','Psidium Guajava Leaf Extract',
  'Myrtus Communis Extract','Eugenia Caryophyllus Bud Extract',
  'Illicium Verum Fruit Extract','Piper Nigrum Fruit Extract',
  'Capsicum Annuum Fruit Extract','Capsicum Frutescens Fruit Extract',
  'Elettaria Cardamomum Seed Extract','Curcuma Longa Rhizome Extract',
  'Alpinia Officinarum Rhizome Extract','Hedychium Coronarium Root Extract',
  'Kaempferia Galanga Root Extract','Costus Root Extract',
  'Valeriana Officinalis Root Extract','Withania Somnifera Root Extract',
  'Bacopa Monnieri Extract','Centella Asiatica Extract',
  'Hydrocotyle Asiatica Extract','Gotu Kola Extract',
  'Tribulus Terrestris Fruit Extract','Mucuna Pruriens Seed Extract',
  'Coleus Forskohlii Root Extract','Gymnema Sylvestre Leaf Extract',
  'Terminalia Chebula Fruit Extract','Terminalia Arjuna Bark Extract',
  'Emblica Officinalis Fruit Extract','Phyllanthus Emblica Fruit Extract',
  'Tinospora Cordifolia Extract','Picrorhiza Kurroa Root Extract',
  'Nardostachys Jatamansi Root Extract','Vetiveria Zizanoides Root Extract',
  'Cymbopogon Citratus Leaf Extract','Cymbopogon Schoenanthus Extract',
  'Citronella Java Extract','Melissa Officinalis Leaf Extract',
  'Nepeta Cataria Extract','Leonurus Cardiaca Extract',
  'Stachys Officinalis Extract','Lamium Album Flower Extract',
  'Marrubium Vulgare Extract','Ballota Nigra Extract',
  'Agastache Mexicana Flower Extract','Monarda Didyma Extract',
  'Prunella Vulgaris Extract','Teucrium Chamaedrys Extract',
  'Ajuga Reptans Extract','Lycopus Europaeus Extract',
  'Verbena Officinalis Extract','Lippia Citriodora Leaf Extract',
  'Vitex Agnus-Castus Extract','Clerodendrum Trichotomum Extract',
  'Buddleja Davidii Extract','Scrophularia Nodosa Extract',
  'Digitalis Purpurea Extract','Rehmannia Chinensis Root Extract',
  'Sesamum Indicum Seed Extract','Sesamum Indicum Leaf Extract',
  'Olea Europaea Leaf Extract','Olea Europaea Fruit Extract',
  'Jasminum Officinale Oil','Ligustrum Lucidum Fruit Extract',
  'Fraxinus Excelsior Bud Extract','Syringa Vulgaris Extract',
  'Gentiana Lutea Root Extract','Centaurium Erythraea Extract',
  'Swertia Chirayita Extract','Menyanthes Trifoliata Leaf Extract',
  'Ilex Paraguariensis Leaf Extract','Ilex Aquifolium Extract',
  'Hedera Helix Extract','Panax Notoginseng Root Extract',
  'Eleutherococcus Senticosus Root Extract','Aralia Mandshurica Root Extract',
  'Cimicifuga Racemosa Root Extract','Actaea Racemosa Root Extract',
  'Hydrastis Canadensis Root Extract','Sanguinaria Canadensis Root Extract',
  'Chelidonium Majus Extract','Fumaria Officinalis Extract',
  'Corydalis Yanhusuo Root Extract','Papaver Rhoeas Petal Extract',
  'Papaver Somniferum Seed Extract','Escholtzia Californica Extract',
  'Berberis Vulgaris Root Extract','Mahonia Aquifolium Root Extract',
  'Magnolia Officinalis Bark Extract','Magnolia Grandiflora Flower Extract',
  'Liriodendron Tulipifera Extract','Michelia Alba Flower Extract',
  'Cananga Odorata Flower Extract','Ylang Ylang Flower Extract',
  'Artabotrys Odoratissimus Flower Extract','Polyalthia Longifolia Extract',
  'Annona Reticulata Leaf Extract','Asimina Triloba Fruit Extract',
  'Amygdalus Communis Extract','Cydonia Oblonga Seed Extract',
  'Rubus Fruticosus Leaf Extract','Rubus Occidentalis Fruit Extract',
  'Potentilla Erecta Root Extract','Filipendula Ulmaria Extract',
  'Agrimonia Eupatoria Extract','Alchemilla Vulgaris Extract',
  'Sanguisorba Officinalis Root Extract','Rosa Centifolia Flower Water',
  'Rosa Damascena Flower Extract','Spiraea Ulmaria Extract',
  'Lythrum Salicaria Extract','Punica Granatum Flower Extract',
  'Epilobium Angustifolium Extract','Oenothera Biennis Extract',
  'Circaea Lutetiana Extract','Ludwigia Repens Extract',
  'Trapa Natans Fruit Extract','Myriophyllum Aquaticum Extract',
  'Hippuris Vulgaris Extract','Vinca Minor Extract',
  'Catharanthus Roseus Extract','Rauwolfia Serpentina Root Extract',
  'Holarrhena Antidysenterica Bark Extract','Strophanthus Gratus Extract',
  'Asclepias Tuberosa Root Extract','Cynanchum Atratum Root Extract',
  'Periploca Sepium Root Extract','Calotropis Procera Extract',
  'Symphytum Officinale Root Extract','Borago Officinalis Extract',
  'Echium Plantagineum Seed Extract','Lithospermum Erythrorhizon Root Extract',
  'Alkanna Tinctoria Root Extract','Anchusa Officinalis Extract',
  'Convolvulus Arvensis Extract','Ipomoea Batatas Root Extract',
  'Datura Stramonium Extract','Solanum Lycopersicum Fruit Extract',
  'Solanum Melongena Fruit Extract','Physalis Peruviana Fruit Extract',
  'Capsicum Annuum Extract','Nicotiana Tabacum Extract',
  'Lycium Barbarum Extract','Withania Somnifera Extract',
  'Verbascum Thapsus Extract','Linaria Vulgaris Extract',
  'Scrophularia Nodosa Extract','Mimulus Guttatus Extract',
  'Catalpa Bignonioides Extract','Sesamum Radiatum Extract',
  'Acanthus Mollis Extract','Justicia Adhatoda Leaf Extract',
  'Andrographis Paniculata Extract','Vitex Negundo Extract',
  'Stachytarpheta Jamaicensis Extract','Lantana Camara Extract',
  'Origanum Majorana Extract','Rosmarinus Officinalis Extract',
  'Salvia Hispanica Seed Extract','Salvia Miltiorrhiza Root Extract',
  'Scutellaria Lateriflora Extract','Perilla Frutescens Leaf Extract',
  'Pogostemon Cablin Extract','Plectranthus Barbatus Extract',
  'Ocimum Sanctum Extract','Ocimum Gratissimum Extract',
  'Mentha Spicata Leaf Extract','Mentha Arvensis Leaf Extract',
  'Hyssopus Officinalis Extract','Satureja Montana Extract',
  'Clinopodium Vulgare Extract','Calamintha Nepeta Extract',
  'Dracocephalum Moldavica Extract','Elsholtzia Ciliata Extract',
  'Schizonepeta Tenuifolia Extract','Mosla Chinensis Extract',
  'Artemisia Vulgaris Extract','Artemisia Absinthium Extract',
  'Artemisia Annua Extract','Artemisia Capillaris Extract',
  'Artemisia Argyi Leaf Extract','Artemisia Dracunculus Extract',
  'Chrysanthemum Parthenium Extract','Tanacetum Vulgare Extract',
  'Achillea Millefolium Extract','Anthemis Nobilis Flower Extract',
  'Bellis Perennis Flower Extract','Tussilago Farfara Leaf Extract',
  'Petasites Japonicus Root Extract','Senecio Vulgaris Extract',
  'Solidago Virgaurea Extract','Aster Tataricus Root Extract',
  'Helichrysum Italicum Extract','Helichrysum Arenarium Extract',
  'Inula Helenium Root Extract','Bidens Pilosa Extract',
  'Tagetes Erecta Flower Extract','Tagetes Patula Flower Extract',
  'Calendula Officinalis Extract','Dahlia Variabilis Tuber Extract',
  'Cichorium Intybus Root Extract','Lactuca Sativa Leaf Extract',
  'Taraxacum Officinale Root Extract','Arctium Lappa Root Extract',
  'Cnicus Benedictus Extract','Silybum Marianum Seed Extract',
  'Cynara Scolymus Leaf Extract','Echinops Ritro Extract',
  'Saussurea Involucrata Extract','Carthamus Tinctorius Flower Extract',
  'Aster Scaber Extract','Atractylodes Japonica Rhizome Extract',
  'Aralia Cordata Root Extract','Campanula Medium Extract',
  'Platycodon Grandiflorus Root Extract','Codonopsis Lanceolata Root Extract',
  'Adenophora Triphylla Root Extract','Lobelia Inflata Extract',
  'Dipsacus Fullonum Extract','Patrinia Scabiosifolia Extract',
  'Valeriana Fauriei Root Extract','Nardostachys Chinensis Extract',
  'Viburnum Opulus Extract','Lonicera Japonica Extract',
  'Abelia Chinensis Extract','Weigela Florida Extract',
  'Diervilla Lonicera Extract','Sambucus Nigra Extract',
  'Sambucus Canadensis Fruit Extract','Adoxa Moschatellina Extract',
  'Caprifoliaceae Extract','Scabiosa Atropurpurea Extract',
  'Daucus Carota Sativa Root Extract','Apium Graveolens Extract',
  'Petroselinum Crispum Extract','Coriandrum Sativum Extract',
  'Foeniculum Vulgare Fruit Extract','Anethum Graveolens Extract',
  'Carum Carvi Fruit Extract','Pimpinella Anisum Fruit Extract',
  'Levisticum Officinale Root Extract','Angelica Archangelica Extract',
  'Cnidium Monnieri Fruit Extract','Saposhnikovia Divaricata Root Extract',
  'Ligusticum Wallichii Extract','Oenanthe Javanica Extract',
  'Centella Asiatica Meristem Cell Culture','Malus Domestica Stem Cell Extract',
  'Argania Spinosa Callus Extract','Vitis Vinifera Fruit Cell Extract',
  'Syringa Vulgaris Meristem Cell Culture','Edelweiss Meristem Cell Culture',
  'Leontopodium Alpinum Meristem Cell Culture','Rhodiola Rosea Callus Extract',
  'Buddleja Davidii Meristem Cell Culture','Globularia Cordifolia Callus Extract',
  'Lycopersicon Esculentum Stem Cell Extract','Coffea Bengalensis Seed Oil',
  'Argan Stem Cell Extract','Uttwiler Spatlauber Extract',
  'PhytoCellTec Alp Rose','Solar Vitis Extract','Resistem Extract',
  'Saponaria Pumila Callus Extract','Plantago Lanceolata Callus Extract',
  'Nigella Sativa Seed Extract','Trigonella Foenum-Graecum Extract',
  'Carum Petroselinum Extract','Lepidium Sativum Sprout Extract',
  'Brassica Oleracea Italica Seed Extract','Brassica Oleracea Italica Extract',
  'Brassica Rapa Root Extract','Sinapis Alba Seed Extract',
  'Wasabia Japonica Root Extract','Raphanus Sativus Root Extract',
  'Tropaeolum Majus Extract','Capparis Spinosa Fruit Extract',
  'Reseda Luteola Extract','Cistus Incanus Extract',
  'Helianthemum Nummularium Extract','Viola Odorata Extract',
  'Viola Tricolor Extract','Passiflora Incarnata Extract',
  'Turnera Diffusa Extract','Carica Papaya Leaf Extract',
  'Betula Pubescens Juice','Acer Saccharum Extract',
  'Rhus Chinensis Extract','Pistacia Lentiscus Gum',
  'Schinus Molle Extract','Boswellia Serrata Gum',
  'Commiphora Mukul Resin Extract','Canarium Luzonicum Gum',
  'Myroxylon Balsamum Extract','Liquidambar Styraciflua Resin',
  'Styrax Benzoin Gum','Copaifera Officinalis Resin',
  'Daemonorops Draco Resin Extract','Dracaena Cinnabari Resin Extract',
  'Croton Lechleri Resin Extract','Pterocarpus Marsupium Bark Extract',
  'Dalbergia Odorifera Extract','Acacia Senegal Gum',
  'Astragalus Gummifer Gum','Ceratonia Siliqua Gum',
  'Cyamopsis Tetragonoloba Gum','Trigonella Foenum-Graecum Seed Extract',
  'Cassia Angustifolia Seed Extract','Senna Italica Leaf Extract',
  'Tamarindus Indica Fruit Extract','Glycine Max Seed Extract',
  'Medicago Sativa Extract','Trifolium Pratense Extract',
  'Melilotus Officinalis Extract','Baptisia Tinctoria Root Extract',
  'Lespedeza Capitata Extract','Phaseolus Vulgaris Extract',
  'Vigna Aconitifolia Seed Extract','Cicer Arietinum Seed Extract',
  'Lupinus Albus Seed Extract','Genista Tinctoria Extract',
  'Spartium Junceum Extract','Cytisus Scoparius Extract',
  'Pisum Sativum Extract','Arachis Hypogaea Seedcoat Extract',
  'Pterocarpus Santalinus Wood Extract','Butea Monosperma Extract',
  'Erythrina Variegata Bark Extract','Millettia Reticulata Extract',
  'Pueraria Lobata Root Extract','Kudzu Root Extract',
  'Glycine Soja Seed Extract','Phaseolus Radiatus Seed Extract'
].map(n => ({
  inci_name: n, ingredient_group: 'Plant Extract', origin_type: 'natural',
  function_summary: 'Bitkisel ekstre; antioksidan, yatıştırıcı ve cildi besleyici etki sağlar.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 4: Essential Oils (~150)
// ============================================================
const essentialOils = [
  'Lavandula Angustifolia Oil','Melaleuca Alternifolia Leaf Oil','Citrus Limon Peel Oil',
  'Citrus Aurantium Dulcis Peel Oil','Citrus Sinensis Peel Oil','Citrus Paradisi Peel Oil',
  'Citrus Reticulata Peel Oil','Citrus Bergamia Peel Oil','Citrus Aurantifolia Oil',
  'Citrus Nobilis Peel Oil','Citrus Grandis Peel Oil','Citrus Junos Peel Oil',
  'Eucalyptus Globulus Leaf Oil','Eucalyptus Radiata Leaf Oil','Eucalyptus Citriodora Oil',
  'Mentha Piperita Oil','Mentha Spicata Herb Oil','Mentha Arvensis Herb Oil',
  'Rosmarinus Officinalis Leaf Oil','Salvia Officinalis Oil','Salvia Sclarea Oil',
  'Thymus Vulgaris Oil','Thymus Zygis Herb Oil','Origanum Vulgare Leaf Oil',
  'Ocimum Basilicum Oil','Ocimum Sanctum Oil',
  'Pelargonium Graveolens Oil','Pelargonium Roseum Oil',
  'Cananga Odorata Flower Oil','Ylang Ylang Oil',
  'Santalum Album Oil','Santalum Spicatum Oil',
  'Cedrus Atlantica Bark Oil','Cedrus Deodara Oil',
  'Juniperus Virginiana Oil','Juniperus Communis Fruit Oil',
  'Cupressus Sempervirens Oil','Chamaecyparis Obtusa Oil',
  'Pinus Sylvestris Leaf Oil','Pinus Pinaster Oil','Abies Sibirica Oil','Picea Mariana Oil',
  'Cinnamomum Verum Bark Oil','Cinnamomum Camphora Bark Oil','Cinnamomum Cassia Leaf Oil',
  'Syzygium Aromaticum Bud Oil','Laurus Nobilis Leaf Oil',
  'Ravensara Aromatica Oil','Ravensara Oil',
  'Elettaria Cardamomum Seed Oil','Zingiber Officinale Root Oil',
  'Curcuma Longa Root Oil','Alpinia Galanga Rhizome Oil',
  'Boswellia Carterii Oil','Commiphora Myrrha Oil',
  'Vetiveria Zizanoides Root Oil','Pogostemon Cablin Oil',
  'Cymbopogon Flexuosus Oil','Cymbopogon Martinii Oil',
  'Cymbopogon Nardus Oil','Cymbopogon Citratus Leaf Oil',
  'Melissa Officinalis Leaf Oil','Lippia Citriodora Leaf Oil',
  'Litsea Cubeba Fruit Oil','Backhousia Citriodora Oil',
  'Rosa Damascena Flower Oil','Rosa Centifolia Flower Oil',
  'Jasminum Grandiflorum Flower Oil','Jasminum Sambac Flower Oil',
  'Iris Pallida Root Extract','Iris Germanica Root Oil',
  'Helichrysum Italicum Flower Oil','Helichrysum Angustifolium Oil',
  'Chamaemelum Nobile Flower Oil','Anthemis Nobilis Flower Oil',
  'Tanacetum Annuum Oil','Tanacetum Vulgare Oil',
  'Achillea Millefolium Oil','Artemisia Absinthium Oil',
  'Artemisia Dracunculus Oil','Matricaria Recutita Flower Oil',
  'Tagetes Minuta Flower Oil','Ormenis Multicaulis Oil',
  'Inula Graveolens Oil','Ledum Groenlandicum Oil',
  'Myrtus Communis Oil','Leptospermum Scoparium Oil',
  'Kunzea Ambigua Oil','Callistemon Citrinus Oil',
  'Aniba Rosaeodora Wood Oil','Cinnamomum Camphora Linalooliferum Oil',
  'Ocotea Quixos Bark Oil','Sassafras Albidum Oil',
  'Piper Nigrum Fruit Oil','Schinus Molle Oil',
  'Amyris Balsamifera Bark Oil','Guaiacum Officinale Wood Oil',
  'Nardostachys Jatamansi Oil','Valeriana Officinalis Root Oil',
  'Ferula Galbaniflua Resin Oil','Daucus Carota Sativa Seed Oil',
  'Foeniculum Vulgare Oil','Anethum Graveolens Oil',
  'Coriandrum Sativum Fruit Oil','Cuminum Cyminum Seed Oil',
  'Carum Carvi Fruit Oil','Angelica Archangelica Root Oil',
  'Pimpinella Anisum Fruit Oil','Petroselinum Sativum Seed Oil',
  'Apium Graveolens Seed Oil','Levisticum Officinale Root Oil',
  'Illicium Verum Fruit Oil','Myristica Fragrans Kernel Oil',
  'Canarium Luzonicum Oil','Styrax Benzoin Gum Oil',
  'Copaifera Officinalis Resin Oil','Liquidambar Styraciflua Oil',
  'Gaultheria Procumbens Leaf Oil','Betula Lenta Oil',
  'Hyssopus Officinalis Oil','Satureja Montana Oil',
  'Calamintha Nepeta Oil','Monarda Fistulosa Oil',
  'Agastache Rugosa Oil','Perilla Frutescens Oil',
  'Elsholtzia Stauntonii Oil','Nepeta Cataria Oil',
  'Teucrium Marum Oil','Ajuga Chamaepitys Oil',
  'Cryptomeria Japonica Oil','Thujopsis Dolabrata Oil',
  'Tsuga Canadensis Oil','Abies Balsamea Oil',
  'Pseudotsuga Menziesii Oil','Sequoia Sempervirens Oil',
  'Calocedrus Decurrens Oil','Fokienia Hodginsii Oil',
  'Widdringtonia Whytei Oil','Callitris Intratropica Oil',
  'Araucaria Cunninghamii Oil','Agathis Australis Oil',
  'Dacrydium Cupressinum Oil','Podocarpus Totara Oil',
  'Melaleuca Quinquenervia Oil','Melaleuca Leucadendra Oil',
  'Melaleuca Cajuputi Oil','Melaleuca Viridiflora Oil',
  'Eucalyptus Smithii Oil','Eucalyptus Polybractea Oil',
  'Eucalyptus Dives Oil','Eucalyptus Staigeriana Oil',
  'Corymbia Citriodora Oil','Backhousia Myrtifolia Oil',
  'Pittosporum Undulatum Oil','Osmanthus Fragrans Flower Oil',
  'Gardenia Jasminoides Oil','Michelia Alba Flower Oil',
  'Magnolia Grandiflora Oil','Champaca Flower Oil',
  'Plumeria Alba Flower Oil','Frangipani Oil',
  'Boronia Megastigma Oil','Wisteria Sinensis Oil'
].map(n => ({
  inci_name: n, ingredient_group: 'Essential Oil', origin_type: 'natural',
  function_summary: 'Uçucu yağ; aromaterapi, antimikrobiyal ve cildi rahatlatıcı özellik taşır.',
  allergen_flag: true, fragrance_flag: true, preservative_flag: false,
  sensitivity_note: 'Uçucu yağlar hassas ciltlerde tahrişe neden olabilir. Seyrelterek kullanılmalıdır.'
}));

// ============================================================
// CATEGORY 5: Vitamins/Antioxidants (~120)
// ============================================================
const vitamins = [
  'Retinyl Palmitate','Retinyl Acetate','Retinyl Linoleate','Retinyl Propionate',
  'Retinyl Retinoate','Hydroxypinacolone Retinoate','Retinal','13-cis Retinoic Acid',
  'Ascorbyl Glucoside','Ascorbyl Tetraisopalmitate','Ascorbyl Methylsilanol Pectinate',
  'Sodium Ascorbyl Phosphate','Magnesium Ascorbyl Phosphate','Ascorbyl Palmitate',
  'Ascorbic Acid Polypeptide','3-O-Ethyl Ascorbic Acid','Ethyl Ascorbic Acid',
  'Aminopropyl Ascorbyl Phosphate','Ascorbyl 2-Phosphate 6-Palmitate',
  'Tocopheryl Acetate','Tocopheryl Linoleate','Tocopheryl Nicotinate',
  'Tocopheryl Phosphate','Tocotrienol','Mixed Tocopherols','Delta-Tocopherol',
  'Gamma-Tocopherol','Alpha-Tocopherol','Beta-Tocopherol',
  'Dihydrolipoic Acid','Alpha-Lipoic Acid','Thioctic Acid',
  'Ubiquinol','Idebenone','Plastoquinone',
  'Ergothioneine','L-Ergothioneine',
  'Superoxide Dismutase','Catalase','Glutathione','L-Glutathione',
  'N-Acetyl Cysteine','N-Acetyl Glucosamine',
  'Pycnogenol','Pine Bark Extract',
  'Lycopene','Beta-Carotene','Alpha-Carotene','Lutein','Zeaxanthin',
  'Astaxanthin','Canthaxanthin','Fucoxanthin','Cryptoxanthin',
  'Phytoene','Phytofluene',
  'Quercetin','Rutin','Hesperidin','Naringenin','Kaempferol',
  'Myricetin','Apigenin','Luteolin','Chrysin','Baicalein',
  'Epigallocatechin Gallate','Epicatechin','Catechin','Theaflavin',
  'Procyanidin','Proanthocyanidin','Anthocyanin','Delphinidin','Cyanidin',
  'Pelargonidin','Malvidin','Peonidin','Petunidin',
  'Chlorogenic Acid','Caffeic Acid','Rosmarinic Acid','Ellagic Acid',
  'Gallic Acid','Protocatechuic Acid','Vanillic Acid','Syringic Acid',
  'Hydroxycinnamic Acid','Hydroxycoumarins','Stilbenes',
  'Pterostilbene','Piceatannol','Oxyresveratrol',
  'Carnosic Acid','Carnosol','Rosmanol',
  'Curcuminoids','Demethoxycurcumin','Bisdemethoxycurcumin',
  'Silymarin','Silibinin','Silicristin','Silidianin',
  'Dihydromyricetin','Taxifolin','Fustin',
  'Honokiol','Magnolol','Obovatol',
  'Tocotrienyl Acetate','Tocotrienyl Linoleate',
  'Phylloquinone','Menaquinone-7','Menadione',
  'Pyridoxine','Pyridoxal Phosphate','Thiamine HCl',
  'Riboflavin','Riboflavin Phosphate','Folic Acid','Folacin',
  'Cyanocobalamin','Methylcobalamin','Biotin','D-Biotin',
  'Calcium Pantothenate','Nicotinamide Mononucleotide','Nicotinamide Riboside',
  'Dipalmitoyl Hydroxyproline','Palmitoyl Hydroxyproline',
  'Hydroxytyrosol','Oleuropein','Verbascoside',
  'Mangiferin','Nordihydroguaiaretic Acid'
].map(n => ({
  inci_name: n, ingredient_group: 'Vitamin/Antioxidant', origin_type: 'synthetic',
  function_summary: 'Antioksidan/vitamin; serbest radikallere karşı koruma ve cilt yenilenmesini destekler.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 6: Peptides (~100)
// ============================================================
const peptides = [
  'Palmitoyl Pentapeptide-4','Acetyl Hexapeptide-8','Palmitoyl Tripeptide-1',
  'Palmitoyl Tetrapeptide-7','Copper Tripeptide-1','Palmitoyl Tripeptide-5',
  'Palmitoyl Dipeptide-5 Diaminobutyroyl Hydroxythreonine',
  'Palmitoyl Dipeptide-5 Diaminohydroxybutyrate',
  'Acetyl Tetrapeptide-5','Acetyl Tetrapeptide-9','Acetyl Tetrapeptide-11',
  'Acetyl Tetrapeptide-2','Acetyl Tetrapeptide-15','Acetyl Tetrapeptide-3',
  'Acetyl Octapeptide-3','Acetyl Dipeptide-1 Cetyl Ester',
  'Palmitoyl Hexapeptide-12','Palmitoyl Hexapeptide-14',
  'Palmitoyl Tripeptide-28','Palmitoyl Tripeptide-38',
  'Palmitoyl Oligopeptide','Palmitoyl Decapeptide-20',
  'Palmitoyl Heptapeptide-14','Palmitoyl Tetrapeptide-3',
  'Nonapeptide-1','Decapeptide-4','Hexapeptide-2',
  'Pentapeptide-18','Pentapeptide-3','Pentapeptide-17',
  'Tripeptide-1','Tripeptide-3','Tripeptide-5','Tripeptide-10 Citrulline',
  'Tripeptide-29','Tripeptide-32','Tripeptide-9 Citrulline',
  'Dipeptide-2','Dipeptide-4','Dipeptide Diaminobutyroyl Benzylamide Diacetate',
  'Oligopeptide-6','Oligopeptide-20','Oligopeptide-24','Oligopeptide-34','Oligopeptide-68',
  'Hexapeptide-9','Hexapeptide-10','Hexapeptide-11','Hexapeptide-3',
  'Heptapeptide-15','Tetrapeptide-21','Tetrapeptide-26','Tetrapeptide-30',
  'Myristoyl Pentapeptide-17','Myristoyl Tetrapeptide-12','Myristoyl Hexapeptide-16',
  'Myristoyl Nonapeptide-3','Myristoyl Pentapeptide-8','Myristoyl Tripeptide-4',
  'Biotinoyl Tripeptide-1','Octapeptide-2',
  'Leuphasyl','SYN-AKE','SNAP-8','Argireline',
  'Matrixyl','Matrixyl 3000','Matrixyl Synthe 6',
  'Progeline','Relistase','Leuphasyl',
  'Carnosine','Anserine','Balenine',
  'GHK-Cu','AHK-Cu','GHK',
  'Palmitoyl Tripeptide-1/Palmitoyl Tetrapeptide-7',
  'Acetyl Hexapeptide-1','Caprooyl Tetrapeptide-3',
  'Trifluoroacetyl Tripeptide-2','Acetyl Hexapeptide-30',
  'Pentapeptide-25','Pentapeptide-34','Pentapeptide-48',
  'Sh-Oligopeptide-1','Sh-Oligopeptide-2',
  'Sh-Polypeptide-1','Sh-Polypeptide-7','Sh-Polypeptide-9',
  'rh-Polypeptide-1','rh-Oligopeptide-1','rh-Oligopeptide-2',
  'Palmitoyl Tripeptide-8','Palmitoyl Dipeptide-6',
  'Dipeptide-10','Dipeptide-3','Cyclopeptide-5',
  'Palmitoyl Pentapeptide-3','Hexanoyl Dipeptide-3 Norleucine Acetate',
  'Acetyl Dipeptide-3 Aminohexanoate',
  'Trifluoroacetyl Tripeptide-2','Palmitoyl Tripeptide-53',
  'Palmitoyl Tetrapeptide-10','Palmitoyl Tripeptide-3/7',
  'Acetylarginyltryptophyl Diphenylglycine','Lauroyl Lysine'
].map(n => ({
  inci_name: n, ingredient_group: 'Peptide', origin_type: 'biotech',
  function_summary: 'Peptit; kolajen sentezini uyarır, kırışıklık azaltıcı ve cilt sıkılaştırıcı etki gösterir.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 7: Acids (~60)
// ============================================================
const acids = [
  'Tartaric Acid','Phytic Acid','Pyruvic Acid','Citric Acid','Malic Acid',
  'Succinic Acid','Fumaric Acid','Oxalic Acid','Malonic Acid',
  'Trichloroacetic Acid','Polyhydroxy Acid','Lactobionic Acid',
  'Gluconolactone','Galactaric Acid','Glucaric Acid',
  'Lipohydroxy Acid','Capryloyl Salicylic Acid',
  'Kojic Dipalmitate','Azelaoyl Diglycinate',
  'Dioic Acid','Sebacic Acid','Undecenoic Acid',
  'Pelargonic Acid','Heptanoic Acid','Valeric Acid',
  'Glutamic Acid','Aspartic Acid','Pyrrolidone Carboxylic Acid',
  'Trans-4-Aminomethylcyclohexanecarboxylic Acid',
  'Carnosic Acid','Madecassic Acid','Asiatic Acid',
  'Usnic Acid','Maslinic Acid','Corosolic Acid',
  'Betulinic Acid','Ursolic Acid','Oleanolic Acid',
  'Glycyrrhetinic Acid','Stearoyl Glycyrrhetinate','Enoxolone',
  'Nordihydroguaiaretic Acid','Tannic Acid','Humic Acid','Fulvic Acid',
  'Alginic Acid','Hyaluronic Acid (Low MW)','Hyaluronic Acid (High MW)',
  'Capryloyl Glycine','10-Hydroxydecanoic Acid','Decanedioic Acid',
  'Ricinoleic Acid','Undecylenic Acid','12-Hydroxystearic Acid',
  'Ascorbyl Glycoside','Beta-Hydroxybutyric Acid',
  'Dicarboxylic Acid','Alpha-Ketoglutaric Acid','Orotic Acid',
  'Hydroxycitric Acid','Dehydroacetic Acid'
].map(n => ({
  inci_name: n, ingredient_group: 'Acid', origin_type: 'synthetic',
  function_summary: 'Asit; eksfoliasyon, pH ayarı veya aktif madde taşıyıcılığı işlevi görür.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 8: UV Filters (~80)
// ============================================================
const uvFilters = [
  'Octocrylene','Avobenzone','Homosalate','Zinc Oxide','Titanium Dioxide',
  'Bemotrizinol','Bisoctrizole','Ethylhexyl Triazone','Diethylamino Hydroxybenzoyl Hexyl Benzoate',
  'Ethylhexyl Salicylate','Butyl Methoxydibenzoylmethane','Methylene Bis-Benzotriazolyl Tetramethylbutylphenol',
  'Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine','Tris-Biphenyl Triazine',
  'Drometrizole Trisiloxane','Diethylhexyl Butamido Triazone',
  'Ethylhexyl Methoxycinnamate','Isoamyl p-Methoxycinnamate',
  'Phenylbenzimidazole Sulfonic Acid','4-Methylbenzylidene Camphor',
  'Terephthalylidene Dicamphor Sulfonic Acid','Polysilicone-15',
  'Meroxyl XL','Meroxyl SX','Parsol SLX','Parsol 1789',
  'Uvinul A Plus','Uvinul T 150','Uvasorb HEB',
  'Neo Heliopan AP','Neo Heliopan OS','Neo Heliopan 357',
  'Tinosorb S','Tinosorb M','Tinosorb A2B',
  'Mexoryl XL','Mexoryl SX',
  'Iscotrizinol','Octisalate','Padimate O','PABA',
  'Cinoxate','Dioxybenzone','Oxybenzone','Sulisobenzone',
  'Meradimate','Enzacamene','Amiloxate',
  'Ecamsule','Bisdisulizole Disodium','Polyacrylamidomethyl Benzylidene Camphor',
  'Benzylidene Camphor Sulfonic Acid','Camphor Benzalkonium Methosulfate',
  'Ferulic Acid','Diethylhexyl Syringylidenemalonate',
  'Triethanolamine Salicylate','DEA-Methoxycinnamate',
  'Glyceryl Ethylhexanoate/Methoxycinnamate',
  'Iron Oxides','Cerium Oxide','Mica','Talc',
  'Hydrogenated Lecithin/Titanium Dioxide','Alumina/Titanium Dioxide',
  'Silica/Titanium Dioxide','Triethoxycaprylylsilane/Titanium Dioxide',
  'Nano Zinc Oxide','Nano Titanium Dioxide','Coated Zinc Oxide','Coated Titanium Dioxide',
  'Methyl Methacrylate Crosspolymer/Titanium Dioxide',
  'Zinc Oxide/Dimethicone','Titanium Dioxide/Alumina/Stearic Acid',
  'C30-38 Olefin/Isopropyl Maleate/MA Copolymer',
  'Disodium Phenyl Dibenzimidazole Tetrasulfonate',
  'Polyester-7','Polyester-8','VP/Hexadecene Copolymer',
  'Nylon-12/Titanium Dioxide','Boron Nitride/Titanium Dioxide'
].map(n => ({
  inci_name: n, ingredient_group: 'UV Filter', origin_type: n.includes('Zinc') || n.includes('Titanium') ? 'mineral' : 'synthetic',
  function_summary: 'UV filtre; UVA/UVB ışınlarından koruma sağlayarak cilt hasarını önler.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 9: Surfactants (~200)
// ============================================================
const surfactants = [
  'Cocamidopropyl Betaine','Sodium Laureth Sulfate','Sodium Lauryl Sulfate',
  'Decyl Glucoside','Coco-Glucoside','Lauryl Glucoside','Caprylyl/Capryl Glucoside',
  'Sodium Cocoyl Isethionate','Sodium Lauroyl Sarcosinate','Sodium Cocoyl Glutamate',
  'Disodium Cocoyl Glutamate','Sodium Lauroyl Glutamate','Potassium Cocoyl Glycinate',
  'Sodium Cocoyl Alaninate','Sodium Lauroyl Methyl Isethionate',
  'Sodium Methyl Cocoyl Taurate','Sodium Methyl Oleoyl Taurate',
  'Cocamidopropyl Hydroxysultaine','Lauramidopropyl Betaine',
  'Cetyl Betaine','Oleamidopropyl Dimethylamine',
  'Coco-Betaine','Babassuamidopropyl Betaine','Undecylenamidopropyl Betaine',
  'Sodium C14-16 Olefin Sulfonate','Ammonium Lauryl Sulfate','Ammonium Laureth Sulfate',
  'Sodium Myreth Sulfate','TEA-Lauryl Sulfate','MEA-Lauryl Sulfate',
  'Sodium Coco Sulfate','Sodium C12-14 Olefin Sulfonate','Sodium C16-18 Olefin Sulfonate',
  'Disodium Laureth Sulfosuccinate','Disodium Cocoamphodiacetate',
  'Sodium Cocoamphoacetate','Disodium Cocoamphodipropionate',
  'Sodium Lauroamphoacetate','Disodium Lauroamphodiacetate',
  'Cocamide DEA','Cocamide MEA','Cocamide MIPA','Lauramide DEA','Linoleamide DEA',
  'Oleamide DEA','Stearamide DEA','Myristamide DEA',
  'PEG-7 Glyceryl Cocoate','PEG-20 Glyceryl Triisostearate',
  'PEG-40 Hydrogenated Castor Oil','PEG-60 Hydrogenated Castor Oil',
  'PEG-80 Sorbitan Laurate','PEG-20 Sorbitan Isostearate',
  'Laureth-4','Laureth-7','Laureth-9','Laureth-23',
  'Ceteth-20','Ceteth-10','Steareth-2','Steareth-20','Steareth-21',
  'Oleth-3','Oleth-5','Oleth-10','Oleth-20',
  'Coceth-7','Trideceth-6','Trideceth-9',
  'PPG-5-Ceteth-20','Ceteareth-6','Ceteareth-12','Ceteareth-20','Ceteareth-25',
  'Polyoxyethylene Lauryl Ether','Polyoxyethylene Cetyl Ether',
  'Sodium Laureth-11 Carboxylate','Sodium Trideceth Sulfate',
  'Sodium Cocoyl Apple Amino Acids','Potassium Cocoate',
  'Sodium Palmate','Sodium Tallowate','Sodium Olivate','Sodium Cocoate',
  'Potassium Olivate','Potassium Palmate','Potassium Stearate',
  'Sodium Stearate','Sodium Palmitate','Sodium Myristate','Sodium Oleate',
  'Triethanolamine Stearate','Diethanolamine Lauryl Sulfate',
  'Sodium Dodecylbenzenesulfonate','Alkylbenzene Sulfonate',
  'Disodium Lauryl Sulfosuccinate','Sodium Dioctyl Sulfosuccinate',
  'Dioctyl Sodium Sulfosuccinate','Sucrose Cocoate','Sucrose Stearate',
  'Sucrose Laurate','Sucrose Palmitate','Sucrose Polystearate',
  'Methyl Glucose Sesquistearate','PEG-20 Methyl Glucose Sesquistearate',
  'PPG-10 Methyl Glucose Ether','Methyl Glucose Laurate',
  'Sorbeth-30','Sorbeth-40','Sorbeth-6',
  'Tween 20','Tween 40','Tween 60','Tween 80',
  'Span 20','Span 40','Span 60','Span 80',
  'Glyceryl Cocoate','Glyceryl Citrate/Lactate/Linoleate/Oleate',
  'Sodium Lauroyl Lactylate','Sodium Stearoyl Lactylate',
  'Calcium Stearoyl Lactylate','Sodium Isostearoyl Lactylate',
  'Lecithin','Hydrogenated Lecithin','Lysophosphatidylcholine',
  'Phosphatidylcholine','Sodium Phytate',
  'Polyglyceryl-4 Laurate','Polyglyceryl-6 Caprylate',
  'Polyglyceryl-10 Laurate','Polyglyceryl-10 Myristate',
  'Polyglyceryl-10 Stearate','Polyglyceryl-10 Oleate',
  'Polyglyceryl-2 Dipolyhydroxystearate','Polyglyceryl-3 Polydimethylsiloxyethyl Dimethicone',
  'Acrylates/C10-30 Alkyl Acrylate Crosspolymer',
  'Sodium Cocoyl Hydrolyzed Collagen','Potassium Undecylenoyl Hydrolyzed Soy Protein',
  'TEA-Cocoyl Hydrolyzed Collagen','Sodium Lauroyl Hydrolyzed Silk',
  'Potassium Cocoyl Hydrolyzed Rice Protein','Sodium Cocoyl Hydrolyzed Soy Protein',
  'Cocoyl Hydrolyzed Keratin','Lauryl PCA','Myristyl PCA',
  'Sodium Lauroyl Oat Amino Acids','Potassium Cocoyl Wheat Amino Acids',
  'Sodium Surfactin','Rhamnolipid','Sophorolipid','Mannosylerythritol Lipid',
  'C12-14 Pareth-3','C12-14 Pareth-7','C12-14 Pareth-12',
  'Isosteareth-20','Isoceteth-20','PPG-1-PEG-9 Lauryl Glycol Ether',
  'Glyceryl Hydroxystearate','Polyglyceryl-4 Caprate',
  'Polyglyceryl-6 Oleate','Sodium Cocoyl Isethionate',
  'Sodium C12-13 Pareth Sulfate','Sodium Lauryl Glucose Carboxylate',
  'Lauryl Methyl Gluceth-10 Hydroxypropyldimonium Chloride',
  'Hydrogenated Palm Glycerides Citrate'
].map(n => ({
  inci_name: n, ingredient_group: 'Surfactant', origin_type: 'synthetic',
  function_summary: 'Yüzey aktif madde; temizleme, köpürtme ve emülsiyon oluşturma işlevi görür.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 10: Silicones (~80)
// ============================================================
const silicones = [
  'Cyclomethicone','Cyclopentasiloxane','Cyclohexasiloxane','Cyclotetrasiloxane',
  'Phenyl Trimethicone','Amodimethicone','Dimethiconol',
  'Cetyl Dimethicone','Stearyl Dimethicone','Cetearyl Methicone',
  'Trimethylsilylamodimethicone','Bis-Aminopropyl Dimethicone',
  'Aminopropyl Dimethicone','Dimethicone Copolyol','Dimethicone/Vinyl Dimethicone Crosspolymer',
  'PEG-10 Dimethicone','PEG-12 Dimethicone','PEG/PPG-18/18 Dimethicone',
  'PEG/PPG-19/19 Dimethicone','PEG/PPG-20/15 Dimethicone',
  'Lauryl PEG-9 Polydimethylsiloxyethyl Dimethicone','Cetyl PEG/PPG-10/1 Dimethicone',
  'Bis-PEG-18 Methyl Ether Dimethyl Silane','PEG-8 Dimethicone',
  'Simethicone','Trisiloxane','Methyl Trimethicone','Caprylyl Methicone',
  'Hexyl Dimethicone','Diphenylsiloxy Phenyl Trimethicone','Phenyl Methicone',
  'Vinyl Dimethicone/Methicone Silsesquioxane Crosspolymer',
  'Dimethicone/Vinyltrimethylsiloxysilicate Crosspolymer',
  'HDI/Trimethylol Hexyllactone Crosspolymer','Polydimethylsiloxane',
  'Silicone Quaternium-18','Silicone Quaternium-22',
  'Polysilicone-11','Polysilicone-15','Polysilicone-22',
  'Divinyldimethicone/Dimethicone Copolymer','Dimethicone PEG-7 Undecylenate',
  'Dimethicone Crosspolymer','Dimethicone/PEG-10/15 Crosspolymer',
  'VP/Dimethicone Acrylate/Polycarbamyl/Polyglycol Ester',
  'Methicone','Hydrogen Dimethicone','Polysilicone-9',
  'Trifluoropropyl Dimethicone','Perfluorodecalin','Perfluorohexane',
  'Methyl Phenyl Polysiloxane','Octyldodecyl Dimethicone',
  'Isododecane','Isohexadecane','C13-15 Alkane',
  'Silica Dimethyl Silylate','Silica Silylate','Trimethylsiloxyphenyl Dimethicone',
  'Phenyl Vinyl Methyl Silicone','Stearoxy Dimethicone',
  'Behenoxy Dimethicone','Amodimethicone/Morpholinomethyl Silsesquioxane Copolymer',
  'Bis-Hydroxy/Methoxy Amodimethicone','Aminopropyl Triethoxysilane',
  'Silicone Resin','Polymethylsilsesquioxane','Tridecyl Trimellitate',
  'Diphenyldimethicone','Polyglyceryl-3 Polydimethylsiloxyethyl Dimethicone',
  'Lauryl Dimethicone','Lauryl Methicone','Lauryl Polyglucose',
  'Sorbitan Dimethicone','Diphenyl Dimethicone/Vinyl Diphenyl Dimethicone Crosspolymer',
  'Trimethylsiloxysilicate','Trimethylsiloxysilylcarbamoyl Pullulan',
  'Silicone Quaternium-16/Glycidoxy Dimethicone Crosspolymer',
  'Polysilicone-29','Hydroxypropyl Dimethicone','Propyl Dimethicone',
  'Butyl Dimethicone','Pentyl Dimethicone'
].map(n => ({
  inci_name: n, ingredient_group: 'Silicone', origin_type: 'synthetic',
  function_summary: 'Silikon; ipeksi doku, nem koruma ve saç/cilt yüzeyini pürüzsüzleştirme sağlar.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 11: Preservatives (~100)
// ============================================================
const preservatives = [
  'Phenoxyethanol','Ethylhexylglycerin','Sodium Benzoate','Potassium Sorbate',
  'Benzyl Alcohol','Dehydroacetic Acid','Sorbic Acid','Benzoic Acid',
  'Chlorphenesin','Caprylhydroxamic Acid','1,2-Hexanediol',
  'Pentylene Glycol','Propylene Glycol','Hexylene Glycol',
  'Methylisothiazolinone','Methylchloroisothiazolinone','Benzisothiazolinone',
  'Octylisothiazolinone','Chlorhexidine Digluconate',
  'Imidazolidinyl Urea','Diazolidinyl Urea','DMDM Hydantoin',
  'Quaternium-15','Bronopol','2-Bromo-2-Nitropropane-1,3-Diol',
  'Sodium Hydroxymethylglycinate','5-Bromo-5-Nitro-1,3-Dioxane',
  'Methylparaben','Ethylparaben','Propylparaben','Butylparaben',
  'Isobutylparaben','Isopropylparaben','Sodium Methylparaben','Sodium Ethylparaben',
  'Sodium Propylparaben','Sodium Butylparaben','Calcium Paraben',
  'Phenyl Benzoate','Undecylenic Acid','Zinc Undecylenate',
  'Salicylic Acid','Zinc Pyrithione','Piroctone Olamine','Climbazole',
  'Triclosan','Triclocarban','Chloroxylenol','Thymol',
  'p-Chloro-m-Cresol','Chloroacetamide','Polyaminopropyl Biguanide',
  'Polyhexanide','Cetylpyridinium Chloride','Benzalkonium Chloride',
  'Cetrimonium Bromide','Didecyldimonium Chloride',
  'Silver','Colloidal Silver','Silver Chloride','Silver Citrate',
  'Copper Oxide','Zinc Ricinoleate',
  'Glyceryl Caprylate','Glyceryl Undecylenate','Glyceryl Caprate',
  'Ethyl Lauroyl Arginate','Decylene Glycol','Undeceth-5',
  'p-Anisic Acid','Levulinic Acid','Sodium Levulinate',
  'Sodium Anisate','Gluconolactone','Calcium Gluconate',
  'o-Cymen-5-ol','Isopropyl Methylphenol',
  'Tocopherol','BHT','BHA','TBHQ',
  'Propyl Gallate','Octyl Gallate','Dodecyl Gallate',
  'Ascorbic Acid','Sodium Erythorbate','Erythorbic Acid',
  'Citric Acid','EDTA','Sodium Metabisulfite',
  'Potassium Metabisulfite','Sodium Sulfite','Sodium Bisulfite',
  'Glutaraldehyde','Formaldehyde','Formalin',
  'Iodopropynyl Butylcarbamate','Zinc Oxide','Hydroxyacetophenone',
  'Ethylhexyl Methoxycrylene','Capryloyl Glycine',
  'Cinnamic Acid','4-Hydroxybenzoic Acid','Dihydroxybenzoic Acid'
].map(n => ({
  inci_name: n, ingredient_group: 'Preservative', origin_type: 'synthetic',
  function_summary: 'Koruyucu; mikrobiyal büyümeyi engelleyerek ürünün raf ömrünü uzatır.',
  allergen_flag: n.includes('isothiazolin') || n.includes('Isothiazolin') || n === 'Methylisothiazolinone' || n === 'Methylchloroisothiazolinone',
  fragrance_flag: false, preservative_flag: true,
  sensitivity_note: 'Koruyucu madde; hassas ciltlerde alerjik reaksiyona yol açabilir.'
}));

// ============================================================
// CATEGORY 12: Emulsifiers (~120)
// ============================================================
const emulsifiers = [
  'Polysorbate 20','Polysorbate 40','Polysorbate 60','Polysorbate 80','Polysorbate 65',
  'PEG-100 Stearate','PEG-40 Stearate','PEG-8 Stearate','PEG-2 Stearate',
  'Glyceryl Stearate','Glyceryl Stearate SE','Glyceryl Stearate Citrate',
  'Ceteareth-20','Ceteareth-12','Ceteareth-6','Ceteareth-25','Ceteareth-33',
  'Ceteth-20','Ceteth-10','Steareth-2','Steareth-20','Steareth-21','Steareth-100',
  'Laureth-4','Laureth-7','Laureth-23',
  'Sorbitan Stearate','Sorbitan Oleate','Sorbitan Palmitate','Sorbitan Laurate',
  'Sorbitan Isostearate','Sorbitan Tristearate','Sorbitan Trioleate',
  'Lecithin','Hydrogenated Lecithin','Lysolecithin',
  'Sodium Stearoyl Lactylate','Sodium Lauroyl Lactylate','Calcium Stearoyl Lactylate',
  'Glyceryl Oleate','Glyceryl Laurate','Glyceryl Linoleate',
  'Glyceryl Hydroxystearate','Glyceryl Isostearate','Glyceryl Citrate/Lactate/Linoleate/Oleate',
  'PEG-7 Glyceryl Cocoate','PEG-20 Glyceryl Stearate','PEG-30 Glyceryl Stearate',
  'PEG-5 Glyceryl Stearate','PEG-200 Glyceryl Stearate',
  'PEG-20 Glyceryl Triisostearate','PEG-20 Glyceryl Oleate',
  'Polyglyceryl-3 Methylglucose Distearate','Polyglyceryl-6 Distearate',
  'Polyglyceryl-3 Stearate','Polyglyceryl-4 Oleate',
  'Polyglyceryl-10 Stearate','Polyglyceryl-10 Laurate','Polyglyceryl-10 Oleate',
  'Polyglyceryl-2 Dipolyhydroxystearate','Polyglyceryl-3 Diisostearate',
  'Polyglyceryl-4 Diisostearate/Polyhydroxystearate/Sebacate',
  'Polyglyceryl-6 Polyricinoleate','Polyglyceryl-2 Sesquiisostearate',
  'Potassium Cetyl Phosphate','Cetyl Phosphate','Dicetyl Phosphate',
  'Trilaureth-4 Phosphate','Dilaureth-4 Phosphate',
  'Acrylates/C10-30 Alkyl Acrylate Crosspolymer',
  'Sodium Acrylates Copolymer','Acrylates Copolymer',
  'Sucrose Stearate','Sucrose Cocoate','Sucrose Laurate','Sucrose Palmitate',
  'Methyl Glucose Sesquistearate','PEG-20 Methyl Glucose Sesquistearate',
  'Propylene Glycol Stearate','Propylene Glycol Stearate SE',
  'Cholesterol','Phytosterols','Beta-Sitosterol','Stigmasterol','Campesterol',
  'Cetearyl Glucoside','Arachidyl Glucoside','C14-22 Alcohols/C12-20 Alkyl Glucoside',
  'PEG-150/Decyl Alcohol/SMDI Copolymer','PEG-150/Stearyl Alcohol/SMDI Copolymer',
  'Oleth-3 Phosphate','Oleth-10 Phosphate',
  'PPG-5-Ceteth-20','PPG-20-Ceteth-20',
  'Glyceryl Dibehenate','Behenyl Alcohol/Cetearyl Glucoside',
  'Glyceryl Dioleate','Glyceryl Dicaprylate/Dicaprate',
  'PEG-150 Pentaerythrityl Tetrastearate','PEG-6 Caprylic/Capric Glycerides',
  'Hydrogenated Palm Glycerides','Hydrogenated Palm Glycerides Citrate',
  'Sodium Cetearyl Sulfate','Sodium Cetyl Sulfate','Sodium Stearyl Sulfate'
].map(n => ({
  inci_name: n, ingredient_group: 'Emulsifier', origin_type: 'synthetic',
  function_summary: 'Emülgatör; yağ ve su fazlarını bir arada tutarak stabil karışım oluşturur.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 13: Thickeners (~100)
// ============================================================
const thickeners = [
  'Xanthan Gum','Carbomer','Carbomer 940','Carbomer 941','Carbomer 980','Carbomer 934',
  'Hydroxyethyl Cellulose','Hydroxyethylcellulose','Hydroxypropyl Methylcellulose',
  'Hydroxypropyl Cellulose','Methylcellulose','Ethylcellulose','Carboxymethyl Cellulose',
  'Sodium Carboxymethyl Cellulose','Microcrystalline Cellulose','Cellulose Gum',
  'Acrylates/C10-30 Alkyl Acrylate Crosspolymer','Sodium Polyacrylate',
  'Ammonium Acryloyldimethyltaurate/VP Copolymer',
  'Sodium Acryloyldimethyltaurate/VP Crosspolymer',
  'Sodium Acrylates/C10-30 Alkyl Acrylate Crosspolymer',
  'Acrylates/Beheneth-25 Methacrylate Copolymer',
  'Acrylates/Steareth-20 Methacrylate Copolymer',
  'Polyacrylate-13','Polyacrylate Crosspolymer-6',
  'Sodium Polyacryloyldimethyl Taurate','Ammonium Polyacryloyldimethyl Taurate',
  'Gellan Gum','Guar Gum','Guar Hydroxypropyltrimonium Chloride',
  'Hydroxypropyl Guar','Cassia Hydroxypropyltrimonium Chloride',
  'Locust Bean Gum','Tara Gum','Fenugreek Gum','Konjac Glucomannan',
  'Agar','Carrageenan','Kappa-Carrageenan','Iota-Carrageenan','Lambda-Carrageenan',
  'Pectin','Amidated Pectin','Low Methoxyl Pectin','High Methoxyl Pectin',
  'Acacia Senegal Gum','Gum Arabic','Tragacanth Gum',
  'Karaya Gum','Ghatti Gum','Dammar Gum','Mastic Gum',
  'Starch','Corn Starch','Tapioca Starch','Potato Starch','Rice Starch',
  'Hydroxyethyl Starch','Sodium Starch Octenylsuccinate','Aluminum Starch Octenylsuccinate',
  'Dextrin','Maltodextrin','Cyclodextrin','Modified Starch',
  'Gelatin','Collagen','Silk','Chitosan','Chitin',
  'PVP','PVP/VA Copolymer','VP/VA Copolymer',
  'Polyethylene','Polypropylene','Nylon-6','Nylon-12',
  'Silica','Fumed Silica','Hydrated Silica','Silica Dimethyl Silylate',
  'Bentonite','Hectorite','Montmorillonite','Kaolin','Magnesium Aluminum Silicate',
  'Attapulgite','Laponite','Synthetic Fluorphlogopite',
  'Sodium Magnesium Silicate','Lithium Magnesium Sodium Silicate',
  'Magnesium Stearate','Zinc Stearate','Aluminum Stearate',
  'Cetyl Hydroxyethylcellulose','Polyquaternium-37',
  'Polyquaternium-37/PPG-1 Trideceth-6','Polyquaternium-7',
  'Sclerotium Gum','Pullulan','Curdlan','Welan Gum','Diutan Gum',
  'Succinoglycan','Biosaccharide Gum-1','Biosaccharide Gum-2','Biosaccharide Gum-4'
].map(n => ({
  inci_name: n, ingredient_group: 'Thickener', origin_type: n.includes('Gum') || n.includes('Starch') || n.includes('Cellulose') ? 'natural' : 'synthetic',
  function_summary: 'Kıvam artırıcı; formülasyona istenilen viskozite ve dokuyu kazandırır.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 14: pH Adjusters (~50)
// ============================================================
const phAdjusters = [
  'Sodium Hydroxide','Potassium Hydroxide','Triethanolamine','Aminomethyl Propanol',
  'Ammonium Hydroxide','Calcium Hydroxide','Magnesium Hydroxide','Lithium Hydroxide',
  'Sodium Bicarbonate','Potassium Bicarbonate','Sodium Carbonate','Potassium Carbonate',
  'Citric Acid','Lactic Acid','Phosphoric Acid','Hydrochloric Acid',
  'Sulfuric Acid','Acetic Acid','Boric Acid','Gluconic Acid',
  'Sodium Citrate','Potassium Citrate','Sodium Phosphate','Disodium Phosphate',
  'Trisodium Phosphate','Monosodium Phosphate','Sodium Acetate',
  'Sodium Lactate','Potassium Phosphate','Calcium Chloride',
  'AMP-95','Tromethamine','TRIS','Diethanolamine','Monoethanolamine',
  'Isopropanolamine','Diisopropanolamine','Triisopropanolamine',
  'Sodium Gluconate','Potassium Gluconate','Sodium Succinate',
  'Sodium Tartrate','Potassium Tartrate','Cream of Tartar',
  'Arginine','Lysine HCl','Histidine',
  'Sodium Sesquicarbonate','Ammonium Bicarbonate','Magnesium Carbonate'
].map(n => ({
  inci_name: n, ingredient_group: 'pH Adjuster', origin_type: 'synthetic',
  function_summary: 'pH ayarlayıcı; formülasyonun asitlik/bazlık dengesini optimize eder.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 15: Colorants (~150)
// ============================================================
const colorants = [
  'CI 77891','CI 77491','CI 77492','CI 77499','CI 15850','CI 42090','CI 19140','CI 15985',
  'CI 16035','CI 47005','CI 77007','CI 75470','CI 77742','CI 77510','CI 77289','CI 77002',
  'CI 77163','CI 77820','CI 77947','CI 42053','CI 61570','CI 73360','CI 74160','CI 77266',
  'CI 15510','CI 12085','CI 45380','CI 45410','CI 17200','CI 26100','CI 45350','CI 60730',
  'CI 42051','CI 73015','CI 77288','CI 77400','CI 77480','CI 77489','CI 77713','CI 77742',
  'Titanium Dioxide','Iron Oxides','Red Iron Oxide','Yellow Iron Oxide','Black Iron Oxide',
  'Ultramarines','Chromium Oxide Greens','Chromium Hydroxide Green',
  'Manganese Violet','Ferric Ferrocyanide','Ferric Ammonium Ferrocyanide',
  'Carmine','Cochineal','Mica','Sericite','Synthetic Fluorphlogopite',
  'Bismuth Oxychloride','Calcium Aluminum Borosilicate','Calcium Sodium Borosilicate',
  'Tin Oxide','Zinc Oxide','Barium Sulfate','Calcium Carbonate',
  'Aluminum Powder','Bronze Powder','Copper Powder','Gold','Silver',
  'Guanine','CI 75170','Pearl Powder',
  'D&C Red No. 6','D&C Red No. 7','D&C Red No. 27','D&C Red No. 30','D&C Red No. 33',
  'D&C Red No. 36','FD&C Red No. 4','FD&C Red No. 40',
  'D&C Orange No. 4','D&C Orange No. 5',
  'FD&C Yellow No. 5','FD&C Yellow No. 6','D&C Yellow No. 10','D&C Yellow No. 11',
  'FD&C Blue No. 1','D&C Blue No. 4','FD&C Green No. 3',
  'D&C Green No. 5','D&C Green No. 6','D&C Violet No. 2',
  'D&C Brown No. 1','D&C Black No. 2','D&C Black No. 3',
  'Annatto','Beta-Carotene','Caramel','Chlorophyll','Chlorophyllin-Copper Complex',
  'Riboflavin','Curcumin','Lycopene','Paprika Oleoresin',
  'Beet Root Extract','Anthocyanin','Carthamus Tinctorius Flower Extract',
  'Gardenia Blue','Gardenia Yellow','Indigo Naturalis',
  'Rubia Tinctorum Root Extract','Alkanna Tinctoria Root Extract',
  'Lawsonia Inermis Extract','Genipa Americana Fruit Extract',
  'Bixa Orellana Seed Extract','Crocus Sativus Flower Extract',
  'Punica Granatum Extract','Hibiscus Sabdariffa Extract',
  'Opuntia Ficus-Indica Fruit Extract','Carbon Black',
  'Synthetic Iron Oxide','Synthetic Manganese Violet',
  'Aluminum Hydroxide','Calcium Lake','Barium Lake',
  'Strontium Lake','Zirconium Lake',
  'Red 40 Lake','Yellow 5 Lake','Yellow 6 Lake','Blue 1 Lake',
  'Green 3 Lake','Red 7 Lake','Red 6 Lake','Red 33 Lake',
  'Fluorescent Brightener 230','Fluorescent Brightener 351',
  'CI 77000','CI 77004','CI 77019','CI 77120','CI 77220','CI 77231',
  'CI 77346','CI 77745','CI 77795','CI 77861','CI 77868','CI 77891',
  'Dihydroxyacetone','Erythrulose','Melanin'
].map(n => ({
  inci_name: n, ingredient_group: 'Colorant', origin_type: n.startsWith('CI') || n.startsWith('D&C') || n.startsWith('FD&C') ? 'synthetic' : 'natural',
  function_summary: 'Renklendirici; kozmetik ürünlere renk ve estetik görünüm kazandırır.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 16: Fragrance Components (~80)
// ============================================================
const fragranceComponents = [
  'Linalool','Limonene','Geraniol','Citronellol','Eugenol','Coumarin',
  'Citral','Farnesol','Benzyl Alcohol','Benzyl Benzoate','Benzyl Cinnamate',
  'Benzyl Salicylate','Cinnamyl Alcohol','Cinnamal','Anise Alcohol',
  'Hydroxycitronellal','Isoeugenol','Methyl 2-Octynoate',
  'Alpha-Isomethyl Ionone','Butylphenyl Methylpropional','Hexyl Cinnamal',
  'Hydroxyisohexyl 3-Cyclohexene Carboxaldehyde','Amyl Cinnamal',
  'Amylcinnamyl Alcohol','Evernia Prunastri Extract','Evernia Furfuracea Extract',
  'Lyral','HICC','Atranol','Chloroatranol',
  'Methyl Salicylate','Vanillin','Ethyl Vanillin','Heliotropin',
  'Musk Ketone','Musk Xylene','Galaxolide','Tonalide','Celestolide',
  'Cashmeran','Iso E Super','Ambroxan','Sclareol','Sclareolide',
  'Hedione','Calone','Damascone','Damascenone',
  'Ionone','Methylionone','Iraldeine','Irone',
  'Carvone','Menthone','Menthol','Thymol','Carvacrol',
  'Camphor','Borneol','Fenchone','Fenchol','Terpineol',
  'Alpha-Terpineol','Linalyl Acetate','Geranyl Acetate','Neryl Acetate',
  'Citronellyl Acetate','Bornyl Acetate','Terpinyl Acetate',
  'Nerolidol','Bisabolol','Cedrol','Vetiveryl Acetate',
  'Santalol','Patchouli Alcohol','Guaiol','Eudesmol',
  'Musk Ambrette','Indole','Skatole','Civetone','Muscone',
  'Phenylethyl Alcohol','Phenoxyethanol','Benzaldehyde','Acetaldehyde'
].map(n => ({
  inci_name: n, ingredient_group: 'Fragrance', origin_type: 'synthetic',
  function_summary: 'Koku bileşeni; ürüne hoş koku katar. AB kozmetik yönetmeliğine göre etiketlenmesi zorunludur.',
  allergen_flag: true, fragrance_flag: true, preservative_flag: false,
  sensitivity_note: 'Alerjen koku bileşeni; duyarlı kişilerde kontakt dermatite yol açabilir.'
}));

// ============================================================
// CATEGORY 17: Minerals (~60)
// ============================================================
const minerals = [
  'Zinc Oxide','Magnesium Ascorbyl Phosphate','Copper Gluconate','Selenium',
  'Zinc Gluconate','Zinc Sulfate','Zinc Chloride','Zinc Citrate','Zinc Acetate',
  'Copper Sulfate','Copper PCA','Copper Lysinate/Prolinate',
  'Manganese Gluconate','Manganese Sulfate','Manganese PCA',
  'Iron Sulfate','Ferrous Gluconate','Ferric Chloride',
  'Calcium Chloride','Calcium Gluconate','Calcium Pantothenate','Calcium Carbonate',
  'Magnesium Chloride','Magnesium Sulfate','Magnesium Gluconate','Magnesium Oxide',
  'Magnesium Aluminum Silicate','Magnesium Stearate','Magnesium Carbonate',
  'Potassium Chloride','Potassium Iodide','Potassium Sulfate',
  'Sodium Chloride','Sodium Fluoride','Sodium Iodide',
  'Selenium Sulfide','Selenium Disulfide','Sodium Selenite',
  'Chromium Picolinate','Chromium Chloride','Vanadyl Sulfate',
  'Molybdenum Trioxide','Cobalt Chloride','Nickel Sulfate',
  'Strontium Chloride','Barium Sulfate','Lithium Gluconate',
  'Silica','Hydrated Silica','Colloidal Silica','Fumed Silica',
  'Diatomaceous Earth','Kaolin','Bentonite','Montmorillonite',
  'French Green Clay','Rhassoul Clay','Dead Sea Mud','Dead Sea Salt',
  'Himalayan Pink Salt','Epsom Salt','Sea Salt','Volcanic Ash'
].map(n => ({
  inci_name: n, ingredient_group: 'Mineral', origin_type: 'mineral',
  function_summary: 'Mineral; cilde gerekli mineralleri sağlar, arındırıcı veya koruyucu etki gösterir.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 18: Amino Acids (~80)
// ============================================================
const aminoAcids = [
  'Arginine','Lysine','Proline','Serine','Alanine','Histidine',
  'Glycine','Leucine','Isoleucine','Valine','Threonine','Methionine',
  'Phenylalanine','Tryptophan','Tyrosine','Cysteine','Cystine',
  'Glutamine','Asparagine','Aspartic Acid','Glutamic Acid',
  'Hydroxyproline','Hydroxylysine','Citrulline','Ornithine','Taurine',
  'Beta-Alanine','Gamma-Aminobutyric Acid','GABA',
  'Sodium PCA','PCA','Pyrrolidone Carboxylic Acid',
  'Sodium Lauroyl Glutamate','Potassium Aspartate','Magnesium Aspartate',
  'Zinc Aspartate','Calcium Aspartate','Copper Aspartate',
  'Arginine HCl','Lysine HCl','Histidine HCl',
  'L-Arginine','L-Lysine','L-Proline','L-Serine','L-Alanine',
  'L-Glycine','L-Leucine','L-Isoleucine','L-Valine','L-Threonine',
  'L-Methionine','L-Phenylalanine','L-Tryptophan','L-Tyrosine',
  'L-Cysteine','L-Glutamine','L-Asparagine','L-Aspartic Acid','L-Glutamic Acid',
  'L-Hydroxyproline','L-Citrulline','L-Ornithine',
  'N-Acetyl Cysteine','N-Acetyl Tyrosine','N-Acetyl Glucosamine',
  'Acetyl Glutamine','Acetyl Methionine','Acetyl Carnitine',
  'Creatine','Creatinine','Betaine','Trimethylglycine',
  'Sarcosine','Dimethylglycine','L-Carnitine','Acetyl-L-Carnitine',
  'L-Theanine','5-Hydroxytryptophan','S-Adenosyl Methionine',
  'Homocysteine','Selenomethionine','Selenocysteine',
  'Diaminobutyric Acid','2-Aminobutyric Acid','Norvaline','Norleucine'
].map(n => ({
  inci_name: n, ingredient_group: 'Amino Acid', origin_type: 'synthetic',
  function_summary: 'Amino asit; cildin doğal nem faktörünün (NMF) yapı taşı, nemlendirici ve onarıcı.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 19: Fermentation (~50)
// ============================================================
const fermentation = [
  'Saccharomyces Ferment Filtrate','Galactomyces Ferment Filtrate',
  'Bifida Ferment Lysate','Lactobacillus Ferment',
  'Lactobacillus/Soybean Ferment Extract','Lactobacillus/Rice Ferment',
  'Lactobacillus/Pear Juice Ferment Filtrate','Lactobacillus/Punica Granatum Fruit Ferment Extract',
  'Bacillus Ferment','Bacillus/Soybean Ferment Extract',
  'Aspergillus Ferment','Aspergillus/Rice Ferment Extract',
  'Pichia/Resveratrol Ferment Extract','Pichia Anomala Extract',
  'Saccharomyces/Barley Seed Ferment Filtrate','Saccharomyces/Grape Ferment Extract',
  'Saccharomyces/Copper Ferment','Saccharomyces/Zinc Ferment',
  'Saccharomyces/Silicon Ferment','Saccharomyces/Magnesium Ferment',
  'Saccharomyces/Iron Ferment','Saccharomyces Cerevisiae Extract',
  'Lactobacillus/Collagen Ferment Filtrate','Lactobacillus/Arundinaria Gigantea Ferment Filtrate',
  'Lactobacillus/Eriodictyon Californicum Ferment Extract',
  'Lactococcus Ferment Lysate','Streptococcus Thermophilus Ferment',
  'Leuconostoc/Radish Root Ferment Filtrate',
  'Bifidobacterium Longum Ferment','Lactobacillus Acidophilus Ferment',
  'Lactobacillus Rhamnosus Ferment','Lactobacillus Plantarum Ferment',
  'Lactobacillus Casei Ferment','Lactobacillus Bulgaricus Ferment',
  'Enterococcus Faecalis Ferment','Pediococcus Acidilactici Ferment',
  'Pseudoalteromonas Ferment Extract','Alteromonas Ferment Extract',
  'Vitreoscilla Ferment','Thermus Thermophilus Ferment',
  'Deinococcus/Sunflower Seed Oil Ferment','Sphingomonas Ferment Extract',
  'Corynebacterium Glutamicum Ferment','Brevibacterium Ferment',
  'Propionibacterium/Nannochloropsis Oculata Ferment Extract',
  'Bacillus/Folic Acid Ferment Extract','Bacillus/Natto Gum Ferment Filtrate',
  'Rhizopus Oryzae Ferment','Monascus/Rice Ferment',
  'Trichoderma Harzianum Ferment','Aureobasidium Pullulans Ferment',
  'Kluyveromyces Extract','Torulaspora Delbrueckii Extract',
  'Kombucha','Kefir','Yogurt Filtrate'
].map(n => ({
  inci_name: n, ingredient_group: 'Fermentation', origin_type: 'biotech',
  function_summary: 'Fermentasyon ürünü; mikrobiyal fermantasyonla elde edilen biyoaktif bileşenler içerir.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 20: Polymers (~60)
// ============================================================
const polymers = [
  'PVP','VP/VA Copolymer','PVP/VA Copolymer','VP/Hexadecene Copolymer',
  'Polyquaternium-4','Polyquaternium-6','Polyquaternium-7','Polyquaternium-10',
  'Polyquaternium-11','Polyquaternium-22','Polyquaternium-28','Polyquaternium-37',
  'Polyquaternium-39','Polyquaternium-44','Polyquaternium-46','Polyquaternium-47',
  'Polyquaternium-51','Polyquaternium-53','Polyquaternium-55','Polyquaternium-68',
  'Polyquaternium-69','Polyquaternium-72','Polyquaternium-74','Polyquaternium-80',
  'Acrylates Copolymer','Acrylates/Octylacrylamide Copolymer',
  'Acrylates/Steareth-20 Methacrylate Copolymer',
  'Acrylates/C10-30 Alkyl Acrylate Crosspolymer',
  'Sodium Acrylate/Sodium Acryloyldimethyl Taurate Copolymer',
  'Hydroxyethyl Acrylate/Sodium Acryloyldimethyl Taurate Copolymer',
  'Polyurethane-14','Polyurethane-34','Polyurethane-35',
  'PEG-150/Decyl Alcohol/SMDI Copolymer','PEG-150/Stearyl Alcohol/SMDI Copolymer',
  'Nylon-6','Nylon-12','Nylon-66','Polyethylene Terephthalate',
  'Polyester-5','Polyester-7','Polyester-8','Polyester-11',
  'Polymethyl Methacrylate','PMMA','Polylactic Acid','Polyglycolic Acid',
  'Polycaprolactone','Poly-Epsilon-Caprolactone',
  'Polyvinyl Alcohol','Polyvinyl Acetate','Polyvinyl Butyral',
  'Polyethylene Glycol','Polypropylene Glycol','Polybutylene Glycol',
  'Polysorbate-Based Polymer','Copolymer of Vinylpyrrolidone',
  'Sodium Polyaspartate','Polyaspartic Acid',
  'Polyglyceryl-10 Pentastearate','Polyglyceryl-10 Pentaoleate',
  'Vinyl Caprolactam/VP/Dimethylaminoethyl Methacrylate Copolymer',
  'Octylacrylamide/Acrylates/Butylaminoethyl Methacrylate Copolymer',
  'AMP-Acrylates/Allyl Methacrylate Copolymer',
  'Styrene/VP Copolymer','Styrene/Acrylates Copolymer'
].map(n => ({
  inci_name: n, ingredient_group: 'Polymer', origin_type: 'synthetic',
  function_summary: 'Polimer; film oluşturma, kıvam artırma veya sabitleyici işlev görür.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 21: Chelating Agents (~40)
// ============================================================
const chelatingAgents = [
  'Disodium EDTA','Tetrasodium EDTA','Trisodium EDTA','Calcium Disodium EDTA',
  'Disodium EDTA-Copper','EDTA','Pentasodium Pentetate','Trisodium NTA',
  'Tetrasodium Glutamate Diacetate','Sodium Gluconate','Sodium Phytate',
  'Phytic Acid','Sodium Citrate','Citric Acid',
  'Gluconic Acid','Glucono Delta-Lactone','Sodium Gluceptate',
  'Potassium Citrate','Calcium Citrate','Magnesium Citrate',
  'HEDTA','DTPA','Pentasodium DTPA',
  'Trisodium Ethylenediamine Disuccinate','EDDS',
  'Sodium Diethylenetriamine Pentamethylene Phosphonate','DTPMP',
  'Etidronic Acid','Sodium Etidronate','HEDP',
  'Aminotrimethylene Phosphonic Acid','ATMP',
  'Disodium Hydroxyethyliminodiacetate','Trisodium Hydroxyethyliminodiacetate',
  'Methylglycinediacetic Acid','Trisodium Methylglycine Diacetate',
  'Sodium Polyaspartate','Polyaspartic Acid',
  'Ethylenediamine','Diethylenetriamine','Triethylenetetramine',
  'Sodium Oxalate','Potassium Oxalate'
].map(n => ({
  inci_name: n, ingredient_group: 'Chelating Agent', origin_type: 'synthetic',
  function_summary: 'Şelatör; metal iyonlarını bağlayarak ürün stabilitesini artırır.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 22: Solvents (~40)
// ============================================================
const solvents = [
  'Ethanol','Isopropyl Alcohol','Propanediol','Ethoxydiglycol',
  'Butylene Glycol','Pentylene Glycol','Hexylene Glycol','Caprylyl Glycol',
  'Methanol','Denatured Alcohol','SD Alcohol 40-B','Alcohol Denat.',
  'Acetone','Ethyl Acetate','Butyl Acetate','Isobutyl Acetate',
  'Methyl Ethyl Ketone','Cyclohexanone','Toluene','Xylene',
  'Dimethyl Sulfoxide','DMSO','N-Methyl-2-Pyrrolidone','NMP',
  'Diethylene Glycol Monoethyl Ether','DEGEE','PPG-2 Methyl Ether',
  'Dipropylene Glycol','Triethylene Glycol','PEG-4','PEG-6','PEG-8',
  'Methyl Lactate','Ethyl Lactate','Butyl Lactate',
  'Glycerin','Propylene Glycol','PEG-400',
  'Isododecane','Isohexadecane','C13-15 Alkane',
  'Benzyl Alcohol','Phenoxyethanol','2-Phenylethanol'
].map(n => ({
  inci_name: n, ingredient_group: 'Solvent', origin_type: 'synthetic',
  function_summary: 'Çözücü; aktif maddeleri çözer ve formülasyonda homojen dağılım sağlar.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 23: Rare Botanicals (~500)
// ============================================================
const rareBotanicals = [
  'Rhodiola Rosea Root Extract','Schisandra Chinensis Berry Extract',
  'Tribulus Terrestris Extract','Ashwagandha Extract',
  'Astragalus Membranaceus Extract','Cordyceps Militaris Extract',
  'Ganoderma Lucidum Stem Extract','Ophiocordyceps Sinensis Extract',
  'Eucommia Ulmoides Bark Extract','Lycium Chinense Extract',
  'Poria Cocos Sclerotium Extract','Atractylodes Macrocephala Extract',
  'Coix Lacryma-Jobi Seed Extract','Dioscorea Opposita Root Extract',
  'Nelumbo Nucifera Seed Extract','Nelumbo Nucifera Leaf Extract',
  'Nelumbo Nucifera Root Extract','Nymphaea Alba Flower Extract',
  'Victoria Amazonica Extract','Euryale Ferox Seed Extract',
  'Alisma Plantago-Aquatica Extract','Sagittaria Sagittifolia Extract',
  'Butomus Umbellatus Extract','Aponogeton Distachyos Extract',
  'Nuphar Lutea Extract','Nymphoides Peltata Extract',
  'Marsilea Quadrifolia Extract','Salvinia Natans Extract',
  'Azolla Filiculoides Extract','Lemna Minor Extract',
  'Spirodela Polyrhiza Extract','Wolffia Arrhiza Extract',
  'Pistia Stratiotes Extract','Eichhornia Crassipes Extract',
  'Pontederia Cordata Extract','Heteranthera Zosterifolia Extract',
  'Monochoria Korsakowii Extract','Hydrocharis Morsus-Ranae Extract',
  'Stratiotes Aloides Extract','Vallisneria Spiralis Extract',
  'Elodea Canadensis Extract','Hydrilla Verticillata Extract',
  'Najas Marina Extract','Potamogeton Natans Extract',
  'Ruppia Maritima Extract','Zostera Marina Extract',
  'Posidonia Oceanica Extract','Cymodocea Nodosa Extract',
  'Thalassia Testudinum Extract','Halophila Ovalis Extract',
  'Enhalus Acoroides Extract','Syringodium Isoetifolium Extract',
  'Acorus Calamus Root Extract','Alocasia Macrorrhizos Extract',
  'Amorphophallus Konjac Root Extract','Anthurium Andraeanum Extract',
  'Caladium Bicolor Extract','Colocasia Esculenta Extract',
  'Dieffenbachia Seguine Extract','Monstera Deliciosa Extract',
  'Philodendron Bipinnatifidum Extract','Spathiphyllum Wallisii Extract',
  'Zantedeschia Aethiopica Extract','Dracaena Draco Extract',
  'Dracaena Cinnabari Extract','Sansevieria Trifasciata Extract',
  'Aloe Arborescens Leaf Extract','Aloe Vera Leaf Juice Powder',
  'Asparagus Officinalis Root Extract','Asparagus Racemosus Root Extract',
  'Ruscus Aculeatus Root Extract','Convallaria Majalis Extract',
  'Polygonatum Odoratum Extract','Smilax China Root Extract',
  'Smilax Glabra Root Extract','Paris Polyphylla Root Extract',
  'Trillium Erectum Extract','Veratrum Album Extract',
  'Colchicum Autumnale Extract','Gloriosa Superba Extract',
  'Tulipa Gesneriana Extract','Lilium Candidum Flower Extract',
  'Hemerocallis Fulva Extract','Hosta Plantaginea Extract',
  'Agave Tequilana Leaf Extract','Yucca Gloriosa Extract',
  'Dasylirion Wheeleri Extract','Nolina Recurvata Extract',
  'Cordyline Terminalis Extract','Phormium Tenax Extract',
  'Kniphofia Uvaria Extract','Alstroemeria Aurea Extract',
  'Bomarea Multiflora Extract','Iris Germanica Root Extract',
  'Iris Florentina Root Extract','Crocus Sativus Flower Extract',
  'Gladiolus Gandavensis Extract','Freesia Refracta Extract',
  'Sisyrinchium Angustifolium Extract','Eleutherine Bulbosa Extract',
  'Costus Speciosus Root Extract','Curcuma Xanthorrhiza Root Extract',
  'Curcuma Aeruginosa Rhizome Extract','Kaempferia Parviflora Root Extract',
  'Alpinia Officinarum Extract','Hedychium Spicatum Extract',
  'Globba Winitii Extract','Roscoea Purpurea Extract',
  'Cannaceae Extract','Canna Indica Extract',
  'Maranta Arundinacea Root Extract','Calathea Lutea Extract',
  'Heliconia Rostrata Extract','Strelitzia Reginae Extract',
  'Ravenala Madagascariensis Extract','Musa Paradisiaca Extract',
  'Ensete Ventricosum Extract','Orchis Mascula Extract',
  'Vanilla Tahitensis Fruit Extract','Dendrobium Nobile Extract',
  'Phalaenopsis Amabilis Extract','Cymbidium Grandiflorum Extract',
  'Vanda Coerulea Extract','Oncidium Flexuosum Extract',
  'Cattleya Mossiae Extract','Laelia Purpurata Extract',
  'Epidendrum Ibaguense Extract','Bletilla Striata Root Extract',
  'Gastrodia Elata Root Extract','Cypripedium Calceolus Extract',
  'Paphiopedilum Insigne Extract','Spiranthes Sinensis Extract',
  'Pogonia Japonica Extract','Calanthe Discolor Extract',
  'Cephalanthera Damasonium Extract','Epipactis Helleborine Extract',
  'Neottia Nidus-Avis Extract','Listera Ovata Extract',
  'Habenaria Radiata Extract','Pecteilis Susannae Extract',
  'Arundina Graminifolia Extract','Sobralia Macrantha Extract',
  'Thunia Alba Extract','Coelogyne Cristata Extract',
  'Pleione Formosana Extract','Zygopetalum Mackayi Extract',
  'Masdevallia Coccinea Extract','Dracula Vampira Extract',
  'Lepanthes Calodictyon Extract','Stelis Argentata Extract',
  'Bulbophyllum Medusae Extract','Cirrhopetalum Makoyanum Extract',
  'Trichoglottis Philippinensis Extract','Renanthera Coccinea Extract',
  'Aerides Odorata Extract','Rhynchostylis Gigantea Extract',
  'Sarcochilus Hartmannii Extract','Chiloschista Lunifera Extract',
  'Microcoelia Exilis Extract','Angraecum Sesquipedale Extract',
  'Jumellea Fragrans Extract','Rangaeris Muscicola Extract',
  'Polystachya Bella Extract','Eulophia Petersii Extract',
  'Disa Uniflora Extract','Satyrium Coriifolium Extract',
  'Disperis Capensis Extract','Bonatea Speciosa Extract',
  'Calanthe Sylvatica Extract','Aerangis Luteoalba Extract',
  'Chamaecrista Fasciculata Extract','Chamaecrista Nictitans Extract',
  'Tephrosia Purpurea Extract','Desmodium Gangeticum Extract',
  'Abrus Precatorius Extract','Mucuna Pruriens Extract',
  'Clitoria Ternatea Extract','Pongamia Pinnata Extract',
  'Derris Indica Extract','Dalbergia Sissoo Extract',
  'Pterocarpus Santalinus Extract','Pterocarpus Indicus Extract',
  'Caesalpinia Sappan Wood Extract','Caesalpinia Pulcherrima Extract',
  'Bauhinia Variegata Extract','Bauhinia Purpurea Extract',
  'Cercis Siliquastrum Extract','Cercis Canadensis Extract',
  'Gleditsia Triacanthos Extract','Gymnocladus Dioicus Extract',
  'Robinia Pseudoacacia Extract','Sophora Tomentosa Extract',
  'Cladrastis Kentukea Extract','Laburnum Anagyroides Extract',
  'Wisteria Floribunda Extract','Cytisus Scoparius Extract',
  'Genista Tinctoria Extract','Ulex Europaeus Extract',
  'Acacia Dealbata Extract','Acacia Farnesiana Extract',
  'Albizzia Julibrissin Bark Extract','Albizzia Lebbeck Extract',
  'Mimosa Pudica Extract','Mimosa Tenuiflora Bark Extract',
  'Prosopis Juliflora Extract','Inga Edulis Extract',
  'Parkia Biglobosa Extract','Entada Phaseoloides Extract',
  'Samanea Saman Extract','Pithecellobium Dulce Extract',
  'Calliandra Haematocephala Extract','Leucaena Leucocephala Extract',
  'Adenanthera Pavonina Extract','Ormosia Hosiei Extract',
  'Erythrina Crista-Galli Extract','Gliricidia Sepium Extract',
  'Millettia Pinnata Extract','Pongamia Glabra Extract',
  'Lonchocarpus Urucu Extract','Piscidia Piscipula Extract',
  'Andira Inermis Extract','Dipteryx Odorata Extract',
  'Myroxylon Pereirae Extract','Copaifera Langsdorffii Extract',
  'Hymenaea Courbaril Extract','Daniellia Oliveri Extract',
  'Detarium Microcarpum Extract','Guibourtia Demeusei Extract',
  'Prioria Copaifera Extract','Sindora Siamensis Extract',
  'Intsia Bijuga Extract','Afzelia Africana Extract',
  'Cynometra Cauliflora Extract','Amherstia Nobilis Extract',
  'Brownea Grandiceps Extract','Saraca Asoca Extract',
  'Tamarindus Indica Extract','Dialium Guineense Extract',
  'Piliostigma Thonningii Extract','Griffonia Simplicifolia Seed Extract',
  'Senna Alata Leaf Extract','Cassia Fistula Extract',
  'Chamaecrista Rotundifolia Extract','Delonix Regia Extract',
  'Schotia Brachypetala Extract','Colvillea Racemosa Extract',
  'Gleditsia Japonica Fruit Extract','Gymnocladus Chinensis Extract',
  'Hematoxylum Campechianum Extract','Haematoxylum Brasiletto Extract',
  'Peltophorum Pterocarpum Extract','Mora Excelsa Extract',
  'Eperua Falcata Extract','Crudia Amazonica Extract',
  'Dimorphandra Mollis Extract','Stryphnodendron Adstringens Extract',
  'Anadenanthera Peregrina Extract','Parkinsonia Aculeata Extract',
  'Swartzia Madagascariensis Extract','Ateleia Herbert-Smithii Extract',
  'Cyathostegia Mathewsii Extract','Dussia Tessmannii Extract',
  'Acosmium Dasycarpum Extract','Bowdichia Virgilioides Extract',
  'Tipuana Tipu Extract','Vatairea Macrocarpa Extract',
  'Platymiscium Pinnatum Extract','Centrolobium Tomentosum Extract',
  'Machaerium Villosum Extract','Dalbergia Nigra Extract',
  'Pterocarpus Angolensis Extract','Drepanocarpus Lunatus Extract',
  'Derris Elliptica Extract','Amorpha Fruticosa Extract',
  'Tephrosia Vogelii Extract','Indigofera Tinctoria Extract',
  'Indigofera Suffruticosa Extract','Baptisia Australis Extract',
  'Thermopsis Rhombifolia Extract','Anagyris Foetida Extract',
  'Hedysarum Coronarium Extract','Onobrychis Viciifolia Extract',
  'Lespedeza Bicolor Extract','Kummerowia Striata Extract',
  'Alysicarpus Vaginalis Extract','Stylosanthes Guianensis Extract',
  'Arachis Pintoi Extract','Lotononis Bainesii Extract',
  'Crotalaria Juncea Extract','Sesbania Grandiflora Extract',
  'Astragalus Sinicus Extract','Oxytropis Lambertii Extract',
  'Tragacanth Gum','Astragalus Gummifer Extract',
  'Glycyrrhiza Uralensis Root Extract','Abrus Cantoniensis Extract',
  'Pueraria Montana Var. Lobata Extract','Kudzu Extract',
  'Psophocarpus Tetragonolobus Extract','Pachyrhizus Erosus Root Extract',
  'Lablab Purpureus Extract','Cajanus Cajan Extract',
  'Vigna Unguiculata Extract','Vigna Radiata Extract',
  'Cyamopsis Tetragonoloba Extract','Trigonella Corniculata Extract',
  'Melilotus Albus Extract','Trifolium Repens Extract',
  'Medicago Lupulina Extract','Anthyllis Vulneraria Extract',
  'Coronilla Varia Extract','Hippocrepis Comosa Extract',
  'Scorpiurus Muricatus Extract','Ornithopus Sativus Extract',
  'Lotus Corniculatus Extract','Dorycnium Pentaphyllum Extract',
  'Tetragonolobus Purpureus Extract','Galega Officinalis Extract',
  'Colutea Arborescens Extract','Cicer Arietinum Extract',
  'Lens Culinaris Seed Extract','Pisum Sativum Sprout Extract',
  'Vicia Faba Seed Extract','Lathyrus Odoratus Extract',
  'Lathyrus Sativus Extract','Cicer Pinnatifidum Extract',
  'Ononis Spinosa Extract','Ononis Repens Extract',
  'Bituminaria Bituminosa Extract','Cullen Australasicum Extract',
  'Psoralea Corylifolia Seed Extract','Bakuchiol',
  'Babchi Oil','Vernonia Amygdalina Extract',
  'Mikania Glomerata Extract','Stevia Rebaudiana Extract',
  'Liatris Spicata Extract','Eupatorium Perfoliatum Extract',
  'Ageratum Conyzoides Extract','Chromolaena Odorata Extract',
  'Parthenium Hysterophorus Extract','Ambrosia Artemisiifolia Extract',
  'Xanthium Strumarium Extract','Siegesbeckia Orientalis Extract',
  'Eclipta Prostrata Extract','Spilanthes Acmella Extract',
  'Wedelia Chinensis Extract','Tridax Procumbens Extract',
  'Synedrella Nodiflora Extract','Enhydra Fluctuans Extract',
  'Blainvillea Acmella Extract','Galinsoga Parviflora Extract',
  'Guizotia Abyssinica Seed Oil','Madia Sativa Extract',
  'Grindelia Robusta Extract','Baccharis Trimera Extract',
  'Pterocaulon Virgatum Extract','Pluchea Indica Extract',
  'Tessaria Integrifolia Extract','Achyrocline Satureioides Extract',
  'Gnaphalium Uliginosum Extract','Antennaria Dioica Extract',
  'Leontopodium Alpinum Extract','Edelweiss Extract',
  'Filago Vulgaris Extract','Micropus Erectus Extract'
].map(n => ({
  inci_name: n, ingredient_group: 'Rare Botanical', origin_type: 'natural',
  function_summary: 'Nadir bitkisel ekstre; özel biyoaktif bileşenler içerir, antioksidan ve koruyucu etki sağlar.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 24: Enzymes (~40)
// ============================================================
const enzymes = [
  'Papain','Bromelain','Subtilisin','Lipase','Protease','Amylase',
  'Cellulase','Lactase','Pectinase','Phytase','Trypsin','Pepsin',
  'Lysozyme','Lactoferrin','Superoxide Dismutase','Catalase',
  'Glucose Oxidase','Laccase','Peroxidase','Tyrosinase',
  'Urease','Invertase','Maltase','Sucrase',
  'Keratinase','Collagenase','Elastase','Hyaluronidase',
  'Ficin','Actinidin','Chymopapain','Stem Bromelain',
  'Thermolysin','Alcalase','Neutrase','Flavourzyme',
  'Transglutaminase','Lipoxygenase','Phospholipase A2','Phospholipase C',
  'Acetylcholinesterase','Arginase'
].map(n => ({
  inci_name: n, ingredient_group: 'Enzyme', origin_type: 'biotech',
  function_summary: 'Enzim; biyokimyasal reaksiyonları katalize eder, eksfoliasyon veya cilt yenilenmesini destekler.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 25: Proteins (~40)
// ============================================================
const proteins = [
  'Hydrolyzed Collagen','Hydrolyzed Keratin','Silk Amino Acids','Hydrolyzed Wheat Protein',
  'Hydrolyzed Soy Protein','Hydrolyzed Rice Protein','Hydrolyzed Oat Protein',
  'Hydrolyzed Corn Protein','Hydrolyzed Elastin','Hydrolyzed Silk',
  'Hydrolyzed Casein','Hydrolyzed Milk Protein','Hydrolyzed Egg Protein',
  'Hydrolyzed Vegetable Protein','Hydrolyzed Yeast Protein',
  'Hydrolyzed Pearl','Hydrolyzed Conchiolin Protein','Hydrolyzed Pea Protein',
  'Hydrolyzed Quinoa','Hydrolyzed Lupine Protein','Hydrolyzed Jojoba Protein',
  'Hydrolyzed Almond Protein','Hydrolyzed Baobab Protein',
  'Hydrolyzed Hemp Seed Protein','Hydrolyzed Adansonia Digitata Seed Protein',
  'Keratin','Collagen','Elastin','Silk','Lactoferrin','Casein',
  'Whey Protein','Albumin','Fibronectin','Laminin',
  'Sericin','Fibroin','Conchiolin','Pearl Protein',
  'Recombinant Human Collagen','Vegan Collagen','Plant-Based Collagen',
  'Myristoyl Pentapeptide-17 Collagen','Palmitoyl Tripeptide-1 Collagen'
].map(n => ({
  inci_name: n, ingredient_group: 'Protein', origin_type: 'biotech',
  function_summary: 'Protein; cildi besler, nem tutar ve yapısal destek sağlar.',
  allergen_flag: n.includes('Milk') || n.includes('Egg') || n.includes('Wheat') || n.includes('Casein'),
  fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 26: Ceramides/Lipids (~50)
// ============================================================
const ceramidesLipids = [
  'Ceramide AP','Ceramide EOP','Ceramide EOS','Ceramide NS','Ceramide NP',
  'Ceramide AS','Ceramide NG','Ceramide AG','Ceramide AH','Ceramide NH',
  'Ceramide 1','Ceramide 2','Ceramide 3','Ceramide 6 II','Ceramide 9',
  'Phytosphingosine','Sphingosine','Sphinganine','Sphingomyelin',
  'Glucosylceramide','Galactosylceramide','Lactosylceramide',
  'Pseudoceramide','Hydroxypropyl Bispalmitamide MEA',
  'Cetyl-PG Hydroxyethyl Palmitamide','Caproyl Sphingosine',
  'N-Stearoyl Phytosphingosine','N-Palmitoyl Sphinganine',
  'N-Oleoyl Phytosphingosine','N-Stearoyl Sphinganine',
  'Phosphatidylcholine','Phosphatidylethanolamine','Phosphatidylserine',
  'Phosphatidylinositol','Phosphatidylglycerol','Lysophosphatidylcholine',
  'Cardiolipin','Dipalmitoylphosphatidylcholine','DPPC',
  'Cholesterol','Cholesterol Sulfate','7-Dehydrocholesterol',
  'Phytosterols','Beta-Sitosterol','Stigmasterol','Campesterol','Brassicasterol',
  'Ergosterol','Lanosterol','Desmosterol',
  'Fatty Acid Complex','Essential Fatty Acid Complex','Omega-3 Fatty Acids','Omega-6 Fatty Acids',
  'Ceramide Complex','Lipid Complex','Skin-Identical Lipid Complex'
].map(n => ({
  inci_name: n, ingredient_group: 'Ceramide/Lipid', origin_type: 'biotech',
  function_summary: 'Seramid/lipit; cilt bariyerini güçlendirir, nem kaybını önler ve onarım sağlar.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// ============================================================
// CATEGORY 27: Other Actives (~120)
// ============================================================
const otherActives = [
  'Adenosine','Ectoin','CICA','Madecassoside','Asiaticoside',
  'Arbutin','Alpha-Arbutin','Beta-Arbutin','Deoxyarbutin',
  'Tranexamic Acid','Aminocaproic Acid','Epsilon-Aminocaproic Acid',
  'Hydroquinone','4-Butylresorcinol','Phenylethyl Resorcinol',
  'Thiamidol','Isobutylamido Thiazolyl Resorcinol',
  'Kojic Acid','Kojic Dipalmitate','Ellagic Acid','Arbutin Glucoside',
  'Licorice Extract','Glabridin','Liquiritin',
  'Undecylenoyl Phenylalanine','Nonanamide','Acetyl Glucosamine',
  'Niacinamide','Nicotinic Acid','Nicotinamide',
  'Bakuchiol','Sytenol A',
  'Cannabidiol','CBD','Cannabigerol','CBG','Cannabinol','CBN',
  'Hemp Extract','Cannabis Sativa Seed Extract',
  'Centella Asiatica Triterpenes','Asiatic Acid','Madecassic Acid',
  'EGF','FGF','IGF','KGF','VEGF','PDGF','TGF-Beta',
  'Sh-Oligopeptide-1','Sh-Oligopeptide-2','Sh-Polypeptide-1',
  'Epidermal Growth Factor','Fibroblast Growth Factor',
  'Human Stem Cell Conditioned Media','Adipose Stem Cell Extract',
  'Exosome','Plant Exosome','Human Placenta Extract',
  'Snail Mucin','Snail Secretion Filtrate','Royal Jelly',
  'Bee Venom','Propolis','Bee Pollen',
  'Salmon DNA','PDRN','Polydeoxyribonucleotide',
  'Spicule','Freshwater Sponge Spicule','Hydra Extract',
  'Centipede Venom Peptide','Spider Silk Protein',
  'Donkey Milk','Goat Milk','Mare Milk','Camel Milk',
  'Truffle Extract','Caviar Extract','Pearl Extract','Gold','Platinum',
  'Diamond Powder','Ruby Powder','Sapphire Powder','Amber Extract',
  'Malachite Extract','Jade Powder','Tourmaline Powder','Obsidian Extract',
  'Meteorite Powder','Volcanic Water','Thermal Water','Glacier Water',
  'Deep Sea Water','Icelandic Water','Alpine Water',
  'Oxygenated Water','Hydrogen Water','Silver Water',
  'ATP','ADP','AMP','NAD+','NADH','FAD','CoA','Acetyl CoA',
  'cAMP','Deoxyribonucleic Acid','Ribonucleic Acid',
  'Spermidine','Spermine','Putrescine',
  'Melatonin','DHEA','Pregnenolone',
  'Retinol Binding Protein','Hyaluronan Synthase',
  'Chlorella Vulgaris Extract','Spirulina Platensis Extract',
  'Arthrospira Platensis Extract','Haematococcus Pluvialis Extract',
  'Dunaliella Salina Extract','Porphyridium Cruentum Extract',
  'Nannochloropsis Oculata Extract','Chlamydomonas Reinhardtii Extract',
  'Scenedesmus Obliquus Extract','Botryococcus Braunii Extract',
  'Fucus Vesiculosus Extract','Ascophyllum Nodosum Extract',
  'Laminaria Digitata Extract','Undaria Pinnatifida Extract',
  'Chondrus Crispus Extract','Porphyra Umbilicalis Extract',
  'Codium Tomentosum Extract','Ulva Lactuca Extract',
  'Padina Pavonica Extract','Ecklonia Cava Extract',
  'Sargassum Fusiforme Extract','Hizikia Fusiformis Extract',
  'Bifurcaria Bifurcata Extract','Pelvetia Canaliculata Extract'
].map(n => ({
  inci_name: n, ingredient_group: 'Active', origin_type: 'biotech',
  function_summary: 'Aktif madde; hedefe yönelik bakım etkisi sağlayan özel kozmetik bileşen.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));


// ============================================================
// MERGE ALL CATEGORIES
// ============================================================
const allIngredients = [
  ...humectants, ...emollients, ...plantExtracts, ...essentialOils,
  ...vitamins, ...peptides, ...acids, ...uvFilters,
  ...surfactants, ...silicones, ...preservatives, ...emulsifiers,
  ...thickeners, ...phAdjusters, ...colorants, ...fragranceComponents,
  ...minerals, ...aminoAcids, ...fermentation, ...polymers,
  ...chelatingAgents, ...solvents, ...rareBotanicals, ...enzymes,
  ...proteins, ...ceramidesLipids, ...otherActives
];

console.log(`Total ingredients generated: ${allIngredients.length}`);

// ============================================================
// INSERT INTO DATABASE
// ============================================================
async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('Connected to database');

  // Deduplicate by slug
  const seen = new Set();
  const unique = [];
  for (const ing of allIngredients) {
    const s = slug(ing.inci_name);
    if (!seen.has(s)) {
      seen.add(s);
      unique.push(ing);
    }
  }
  console.log(`After dedup: ${unique.length} unique ingredients`);

  const BATCH = 100;
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < unique.length; i += BATCH) {
    const batch = unique.slice(i, i + BATCH);
    const values = [];
    const params = [];
    let paramIdx = 1;

    for (const ing of batch) {
      const s = slug(ing.inci_name);
      values.push(`($${paramIdx}, $${paramIdx+1}, $${paramIdx+2}, $${paramIdx+3}, $${paramIdx+4}, $${paramIdx+5}, $${paramIdx+6}, $${paramIdx+7}, $${paramIdx+8}, $${paramIdx+9})`);
      params.push(
        ing.inci_name,
        s,
        ing.ingredient_group,
        ing.origin_type || null,
        ing.function_summary || null,
        ing.sensitivity_note || null,
        ing.allergen_flag || false,
        ing.fragrance_flag || false,
        ing.preservative_flag || false,
        'cosmetic'
      );
      paramIdx += 10;
    }

    const sql = `
      INSERT INTO ingredients (inci_name, ingredient_slug, ingredient_group, origin_type, function_summary, sensitivity_note, allergen_flag, fragrance_flag, preservative_flag, domain_type)
      VALUES ${values.join(', ')}
      ON CONFLICT (ingredient_slug) DO NOTHING
    `;

    const result = await client.query(sql, params);
    inserted += result.rowCount;
    skipped += batch.length - result.rowCount;

    if ((i / BATCH) % 10 === 0) {
      console.log(`Batch ${Math.floor(i/BATCH)+1}: inserted so far ${inserted}, skipped ${skipped}`);
    }
  }

  console.log(`\nDone! Inserted: ${inserted}, Skipped (duplicates): ${skipped}`);

  // Final count
  const countResult = await client.query('SELECT COUNT(*) FROM ingredients');
  console.log(`Total ingredients in database: ${countResult.rows[0].count}`);

  // Category breakdown
  const groupResult = await client.query('SELECT ingredient_group, COUNT(*) as cnt FROM ingredients GROUP BY ingredient_group ORDER BY cnt DESC');
  console.log('\nCategory breakdown:');
  for (const row of groupResult.rows) {
    console.log(`  ${row.ingredient_group}: ${row.cnt}`);
  }

  await client.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
