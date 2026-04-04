const { Client } = require('pg');

const DB_URL = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// Additional Plant Extracts (~300 more)
const morePlantExtracts = [
  'Acacia Catechu Bark Extract','Acanthopanax Senticosus Root Extract',
  'Acer Saccharinum Extract','Achyranthes Bidentata Root Extract',
  'Aconitum Napellus Root Extract','Adhatoda Vasica Leaf Extract',
  'Aegle Marmelos Fruit Extract','Aframomum Melegueta Seed Extract',
  'Agathosma Betulina Leaf Extract','Ailanthus Altissima Bark Extract',
  'Ajuga Turkestanica Extract','Akebia Quinata Extract',
  'Albizia Procera Bark Extract','Aletris Farinosa Root Extract',
  'Alhagi Maurorum Extract','Alisma Orientale Tuber Extract',
  'Allium Cepa Bulb Extract','Allium Sativum Bulb Extract',
  'Alpinia Zerumbet Leaf Extract','Alsophila Spinulosa Extract',
  'Althaea Officinalis Root Extract','Amaranthus Caudatus Seed Extract',
  'Ammi Majus Fruit Extract','Ammi Visnaga Fruit Extract',
  'Amomum Compactum Fruit Extract','Ampelopsis Japonica Root Extract',
  'Anacyclus Pyrethrum Root Extract','Anemarrhena Asphodeloides Root Extract',
  'Angelica Keiskei Extract','Anoectochilus Formosanus Extract',
  'Anthocleista Grandiflora Extract','Apocynum Venetum Leaf Extract',
  'Aquilegia Vulgaris Extract','Aralia Elata Extract',
  'Arbutus Unedo Fruit Extract','Arctostaphylos Uva-Ursi Leaf Extract',
  'Ardisia Japonica Extract','Arisaema Amurense Extract',
  'Aristolochia Debilis Root Extract','Armoracia Rusticana Root Extract',
  'Arnebia Euchroma Root Extract','Artemisia Princeps Leaf Extract',
  'Artocarpus Heterophyllus Seed Extract','Asarum Europaeum Extract',
  'Asphodelus Ramosus Root Extract','Astilbe Chinensis Extract',
  'Astrantia Major Extract','Atractylis Gummifera Extract',
  'Averrhoa Carambola Fruit Extract','Azadirachta Indica Bark Extract',
  'Barleria Prionitis Extract','Basella Alba Leaf Extract',
  'Berberis Aquifolium Root Extract','Bergenia Crassifolia Root Extract',
  'Betonica Officinalis Extract','Bidens Tripartita Extract',
  'Biota Orientalis Leaf Extract','Bischofia Javanica Extract',
  'Blechnum Spicant Extract','Boehmeria Nivea Extract',
  'Boerhaavia Diffusa Root Extract','Borago Officinalis Seed Extract',
  'Brassica Juncea Seed Extract','Brassica Nigra Seed Extract',
  'Bridelia Ferruginea Bark Extract','Broussonetia Papyrifera Extract',
  'Bryonia Dioica Root Extract','Bucida Buceras Extract',
  'Bulnesia Sarmientoi Extract','Bupleurum Chinense Root Extract',
  'Butea Superba Extract','Buxus Sempervirens Extract',
  'Caesalpinia Echinata Extract','Calamus Rotang Extract',
  'Calceolaria Integrifolia Extract','Calendula Arvensis Extract',
  'Callicarpa Americana Leaf Extract','Calopogonium Mucunoides Extract',
  'Caltha Palustris Extract','Camellia Kissii Leaf Extract',
  'Campsis Grandiflora Extract','Canella Winterana Bark Extract',
  'Capparis Ovata Fruit Extract','Carissa Carandas Fruit Extract',
  'Carlina Acaulis Root Extract','Carpinus Betulus Leaf Extract',
  'Cassia Auriculata Leaf Extract','Castanospermum Australe Extract',
  'Catalpa Speciosa Extract','Catha Edulis Leaf Extract',
  'Cedrela Odorata Extract','Ceiba Pentandra Extract',
  'Celastrus Orbiculatus Extract','Celosia Cristata Flower Extract',
  'Celtis Australis Fruit Extract','Centaurea Cyanus Flower Extract',
  'Cephalotaxus Harringtonia Extract','Ceratonia Siliqua Fruit Extract',
  'Ceropegia Woodii Extract','Chaenomeles Sinensis Fruit Extract',
  'Chamaecyparis Lawsoniana Extract','Chelone Glabra Extract',
  'Chenopodium Album Extract','Chlorella Extract',
  'Chondrodendron Tomentosum Extract','Chrysobalanus Icaco Extract',
  'Cinchona Succirubra Bark Extract','Cineraria Maritima Extract',
  'Cirsium Japonicum Extract','Cissampelos Pareira Extract',
  'Cissus Quadrangularis Extract','Citrus Aurantium Leaf Extract',
  'Claytonia Perfoliata Extract','Clematis Vitalba Extract',
  'Cleome Hassleriana Extract','Clerodendrum Inerme Extract',
  'Clethra Alnifolia Extract','Clinacanthus Nutans Leaf Extract',
  'Cnidoscolus Chayamansa Leaf Extract','Codonopsis Tangshen Root Extract',
  'Coffea Canephora Seed Extract','Coleus Amboinicus Leaf Extract',
  'Combretum Micranthum Extract','Commelina Communis Extract',
  'Comptonia Peregrina Extract','Conium Maculatum Extract',
  'Conyza Canadensis Extract','Copernicia Prunifera Wax Extract',
  'Corchorus Olitorius Leaf Extract','Cordia Myxa Fruit Extract',
  'Coreopsis Tinctoria Extract','Cornus Officinalis Fruit Extract',
  'Coronilla Emerus Extract','Corylus Colurna Extract',
  'Cotinus Coggygria Extract','Cotoneaster Microphyllus Extract',
  'Crambe Maritima Extract','Crassula Ovata Extract',
  'Crescentia Cujete Fruit Extract','Crinum Asiaticum Extract',
  'Crossandra Infundibuliformis Extract','Croton Tiglium Extract',
  'Cryptolepis Sanguinolenta Extract','Cucumis Melo Fruit Extract',
  'Cucumis Sativus Fruit Extract','Cunila Origanoides Extract',
  'Curculigo Orchioides Root Extract','Curcuma Aromatica Rhizome Extract',
  'Cuscuta Chinensis Seed Extract','Cyathea Cooperi Extract',
  'Cycas Revoluta Extract','Cyclamen Europaeum Extract',
  'Cydonia Oblonga Fruit Extract','Cynanchum Paniculatum Root Extract',
  'Cynara Cardunculus Extract','Cynodon Dactylon Extract',
  'Cyperus Rotundus Root Extract','Cytinus Hypocistis Extract',
  'Daemonorops Jenkinsiana Extract','Daphne Mezereum Extract',
  'Datisca Cannabina Extract','Datura Metel Extract',
  'Davallia Divaricata Extract','Dendrobium Officinale Extract',
  'Desmodium Adscendens Extract','Dianella Tasmanica Extract',
  'Dictamnus Albus Extract','Dillenia Indica Fruit Extract',
  'Dimocarpus Longan Fruit Extract','Diospyros Kaki Leaf Extract',
  'Dioscorea Villosa Root Extract','Dodonaea Viscosa Extract',
  'Dolichos Biflorus Seed Extract','Drosera Rotundifolia Extract',
  'Drynaria Fortunei Rhizome Extract','Echinacea Angustifolia Root Extract',
  'Echinodorus Grandiflorus Extract','Ehretia Microphylla Extract',
  'Elaeocarpus Serratus Fruit Extract','Elaeagnus Angustifolia Fruit Extract',
  'Embelia Ribes Fruit Extract','Emilia Sonchifolia Extract',
  'Ensete Superbum Extract','Entada Gigas Extract',
  'Epimedium Sagittatum Extract','Eragrostis Tef Seed Extract',
  'Eriocaulon Buergerianum Extract','Eriobotrya Japonica Leaf Extract',
  'Erodium Cicutarium Extract','Eruca Sativa Seed Extract',
  'Eryngium Maritimum Extract','Erythraea Centaurium Extract',
  'Erythronium Dens-Canis Extract','Eugenia Uniflora Leaf Extract',
  'Euphorbia Hirta Extract','Euphrasia Officinalis Extract',
  'Euterpe Oleracea Fruit Extract','Evodia Rutaecarpa Fruit Extract',
  'Excoecaria Agallocha Extract','Fagopyrum Esculentum Seed Extract',
  'Feronia Elephantum Fruit Extract','Ferula Assa-Foetida Extract',
  'Ficus Benghalensis Root Extract','Ficus Elastica Extract',
  'Ficus Religiosa Extract','Firmiana Simplex Extract',
  'Flacourtia Indica Fruit Extract','Flourensia Cernua Extract',
  'Forsythia Viridissima Fruit Extract','Fragaria Ananassa Fruit Extract',
  'Fraxinus Chinensis Bark Extract','Fumaria Parviflora Extract',
  'Galium Aparine Extract','Galium Verum Extract',
  'Gaultheria Shallon Extract','Gaussia Gomez-Pompae Extract',
  'Gelidium Amansii Extract','Gentiana Scabra Root Extract',
  'Geranium Maculatum Extract','Geranium Robertianum Extract',
  'Geum Japonicum Extract','Glechoma Hederacea Extract',
  'Gleditsia Sinensis Fruit Extract','Globba Marantina Extract',
  'Glossogyne Tenuifolia Extract','Glycosmis Pentaphylla Extract',
  'Gomphrena Globosa Extract','Gossypium Hirsutum Extract',
  'Guajacum Officinale Extract','Guarea Guidonia Extract',
  'Guazuma Ulmifolia Extract','Gymnanthemum Amygdalinum Extract',
  'Gynura Procumbens Extract','Gynostemma Pentaphyllum Extract',
  'Gypsophila Paniculata Root Extract','Hagenia Abyssinica Extract',
  'Haloragis Erecta Extract','Hamamelis Mollis Extract',
  'Harpagophytum Procumbens Root Extract','Hedera Canariensis Extract',
  'Hedyotis Diffusa Extract','Helleborus Niger Extract',
  'Hemidesmus Indicus Root Extract','Hemionitis Arifolia Extract',
  'Henna Extract','Hepatica Nobilis Extract',
  'Herniaria Glabra Extract','Hesperis Matronalis Extract',
  'Heteropogon Contortus Extract','Hibiscus Mutabilis Flower Extract',
  'Hippophae Rhamnoides Leaf Extract','Holothuria Extract',
  'Homalomena Occulta Extract','Hordeum Vulgare Extract',
  'Houttuynia Cordata Extract','Hovenia Dulcis Fruit Extract',
  'Humulus Lupulus Extract','Hydrangea Macrophylla Extract',
  'Hylocereus Undatus Fruit Extract','Hypoxis Hemerocallidea Extract',
  'Ilex Kudingcha Extract','Illicium Anisatum Fruit Extract',
  'Impatiens Balsamina Extract','Indigofera Arrecta Extract',
  'Ipomoea Aquatica Extract','Isatis Tinctoria Leaf Extract',
  'Jacaranda Mimosifolia Extract','Jasminum Multiflorum Flower Extract',
  'Jatropha Curcas Seed Extract','Juglans Nigra Shell Extract',
  'Justicia Gendarussa Extract','Kalanchoe Pinnata Leaf Extract',
  'Kalopanax Septemlobus Bark Extract','Knautia Arvensis Extract',
  'Koelreuteria Paniculata Extract','Krameria Triandra Root Extract',
  'Labisia Pumila Extract','Lagerstroemia Speciosa Leaf Extract',
  'Lamium Purpureum Extract','Larrea Divaricata Extract',
  'Laurus Nobilis Leaf Extract','Ledum Palustre Extract',
  'Leonotis Leonurus Extract','Lepidium Peruvianum Root Extract',
  'Lespedeza Juncea Extract','Ligularia Fischeri Leaf Extract',
  'Ligustrum Japonicum Extract','Limonia Acidissima Fruit Extract',
  'Lindera Strychnifolia Root Extract','Lithocarpus Polystachyus Leaf Extract',
  'Litsea Glutinosa Bark Extract','Lobelia Cardinalis Extract',
  'Lomatium Dissectum Extract','Lonicera Caerulea Fruit Extract',
  'Lophatherum Gracile Extract','Ludwigia Octovalvis Extract',
  'Luffa Cylindrica Fruit Extract','Lychnophora Ericoides Extract',
  'Lycopodium Clavatum Extract','Lysimachia Nummularia Extract'
].map(n => ({
  inci_name: n, ingredient_group: 'Plant Extract', origin_type: 'natural',
  function_summary: 'Bitkisel ekstre; antioksidan, yatıştırıcı ve cildi besleyici etki sağlar.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// Additional Rare Botanicals (~300 more)
const moreRareBotanicals = [
  'Magnolia Kobus Bark Extract','Mahonia Bealei Extract',
  'Macaranga Tanarius Leaf Extract','Macleaya Cordata Extract',
  'Macrocystis Pyrifera Extract','Macrotyloma Uniflorum Extract',
  'Maesa Lanceolata Extract','Maianthemum Racemosum Extract',
  'Malpighia Emarginata Fruit Extract','Malva Sylvestris Extract',
  'Mammea Americana Fruit Extract','Mandevilla Laxa Extract',
  'Mangifera Indica Leaf Extract','Manilkara Zapota Fruit Extract',
  'Margyricarpus Pinnatus Extract','Markhamia Lutea Extract',
  'Meconopsis Betonicifolia Extract','Medicago Sativa Seed Extract',
  'Melastoma Candidum Extract','Melia Toosendan Fruit Extract',
  'Melianthus Major Extract','Melodinus Suaveolens Extract',
  'Menispermum Canadense Extract','Mentzelia Lindleyi Extract',
  'Mercurialis Perennis Extract','Mesembryanthemum Crystallinum Extract',
  'Mespilus Germanica Fruit Extract','Metasequoia Glyptostroboides Extract',
  'Meum Athamanticum Extract','Microcos Paniculata Extract',
  'Mikania Cordata Extract','Millettia Japonica Extract',
  'Mimusops Elengi Bark Extract','Mitragyna Speciosa Extract',
  'Momordica Charantia Fruit Extract','Monotropa Uniflora Extract',
  'Morella Cerifera Extract','Morinda Tinctoria Extract',
  'Morina Longifolia Extract','Morus Australis Extract',
  'Mucilago Seminum Lini Extract','Mundulea Sericea Extract',
  'Murraya Koenigii Leaf Extract','Musa Acuminata Fruit Extract',
  'Muscari Neglectum Extract','Myoporum Laetum Extract',
  'Myrciaria Dubia Fruit Extract','Myristica Malabarica Extract',
  'Myrsine Africana Extract','Nandina Domestica Extract',
  'Napaea Dioica Extract','Narcissus Tazetta Extract',
  'Nasturtium Officinale Extract','Nauclea Latifolia Extract',
  'Navarretia Squarrosa Extract','Nepenthes Rafflesiana Extract',
  'Nepeta Sibirica Extract','Nephrolepis Exaltata Extract',
  'Nerium Oleander Extract','Nicandra Physalodes Extract',
  'Nierembergia Scoparia Extract','Nigella Damascena Seed Extract',
  'Nyctanthes Arbor-Tristis Extract','Nymphaea Lotus Extract',
  'Ocimum Americanum Extract','Ocimum Kilimandscharicum Extract',
  'Oenothera Glazioviana Seed Extract','Oldenlandia Diffusa Extract',
  'Onopordum Acanthium Extract','Ophiopogon Japonicus Root Extract',
  'Oplopanax Horridus Extract','Orbignya Phalerata Extract',
  'Origanum Dictamnus Extract','Ornithogalum Umbellatum Extract',
  'Orobanche Rapum-Genistae Extract','Orontium Aquaticum Extract',
  'Orthosiphon Stamineus Leaf Extract','Osmunda Regalis Extract',
  'Ouratea Lucens Extract','Oxalis Acetosella Extract',
  'Pachira Aquatica Extract','Paeonia Anomala Extract',
  'Paliurus Spina-Christi Fruit Extract','Pandanus Amaryllifolius Extract',
  'Panicum Miliaceum Seed Extract','Parietaria Officinalis Extract',
  'Parkia Speciosa Seed Extract','Parnassia Palustris Extract',
  'Paronychia Argentea Extract','Passiflora Caerulea Extract',
  'Patrinia Villosa Root Extract','Paulownia Tomentosa Extract',
  'Pavetta Indica Extract','Peganum Harmala Seed Extract',
  'Pelargonium Zonale Extract','Peltandra Virginica Extract',
  'Pentas Lanceolata Extract','Peperomia Pellucida Extract',
  'Pereskia Aculeata Extract','Pergularia Daemia Extract',
  'Perilla Frutescens Seed Extract','Persicaria Hydropiper Extract',
  'Petiveria Alliacea Extract','Petroselinum Sativum Extract',
  'Peucedanum Ostruthium Extract','Peumus Boldus Leaf Extract',
  'Phaseolus Lunatus Seed Extract','Phaseolus Vulgaris Seed Extract',
  'Phillyrea Latifolia Extract','Phlomis Fruticosa Extract',
  'Phlox Paniculata Extract','Photinia Villosa Extract',
  'Phragmites Australis Extract','Phyla Nodiflora Extract',
  'Phyllostachys Bambusoides Extract','Physalis Alkekengi Fruit Extract',
  'Phytolacca Americana Extract','Picea Abies Leaf Extract',
  'Picrasma Quassioides Extract','Pilea Microphylla Extract',
  'Pimenta Dioica Leaf Extract','Pinguicula Vulgaris Extract',
  'Pinus Brutia Extract','Pinus Cembra Extract',
  'Pinus Densiflora Extract','Pinus Halepensis Bark Extract',
  'Pinus Koraiensis Seed Extract','Pinus Massoniana Leaf Extract',
  'Pinus Nigra Extract','Pinus Radiata Bark Extract',
  'Piper Betle Leaf Extract','Piper Cubeba Fruit Extract',
  'Piper Longum Fruit Extract','Piper Methysticum Root Extract',
  'Pistacia Khinjuk Extract','Pistacia Terebinthus Extract',
  'Pittosporum Tobira Extract','Plantago Asiatica Seed Extract',
  'Platanus Occidentalis Bark Extract','Plectranthus Amboinicus Extract',
  'Pluchea Lanceolata Extract','Plumbago Zeylanica Root Extract',
  'Plumeria Rubra Flower Extract','Podophyllum Peltatum Extract',
  'Pogostemon Stellatus Extract','Polemonium Caeruleum Extract',
  'Polygala Senega Root Extract','Polygala Tenuifolia Root Extract',
  'Polygonatum Multiflorum Extract','Polygonum Aviculare Extract',
  'Polygonum Cuspidatum Root Extract','Polygonum Multiflorum Root Extract',
  'Polypodium Leucotomos Extract','Polyporus Umbellatus Extract',
  'Populus Nigra Bud Extract','Populus Tremuloides Bark Extract',
  'Portulaca Oleracea Extract','Potentilla Anserina Extract',
  'Poterium Sanguisorba Extract','Premna Serratifolia Extract',
  'Primula Veris Extract','Prinsepia Utilis Seed Oil',
  'Prostanthera Rotundifolia Extract','Prunella Vulgaris Extract',
  'Prunus Laurocerasus Leaf Extract','Prunus Lusitanica Extract',
  'Prunus Mahaleb Seed Extract','Prunus Padus Bark Extract',
  'Prunus Spinosa Fruit Extract','Pseuderanthemum Palatiferum Extract',
  'Pseudotsuga Menziesii Bark Extract','Psidium Cattleianum Extract',
  'Psychotria Colorata Extract','Pteris Vittata Extract',
  'Pterocarpus Erinaceus Extract','Pterocephalus Perennis Extract',
  'Pterocarya Fraxinifolia Extract','Ptychopetalum Olacoides Extract',
  'Pueraria Mirifica Root Extract','Pulmonaria Officinalis Extract',
  'Punica Granatum Peel Extract','Pyracantha Coccinea Fruit Extract',
  'Pyrostegia Venusta Extract','Quassia Amara Wood Extract',
  'Quercus Infectoria Gall Extract','Quercus Petraea Extract',
  'Quercus Suber Bark Extract','Quillaja Saponaria Extract',
  'Quisqualis Indica Extract','Ranunculus Ficaria Extract',
  'Raphia Farinifera Extract','Rauwolfia Vomitoria Extract',
  'Rhamnus Cathartica Extract','Rhamnus Frangula Bark Extract',
  'Rhamnus Purshiana Bark Extract','Rhaponticum Carthamoides Root Extract',
  'Rheum Officinale Root Extract','Rheum Palmatum Root Extract',
  'Rhizophora Mangle Extract','Rhodiola Crenulata Root Extract',
  'Rhododendron Ferrugineum Extract','Rhus Coriaria Fruit Extract',
  'Ribes Nigrum Fruit Extract','Ribes Rubrum Fruit Extract',
  'Ribes Uva-Crispa Fruit Extract','Ricinus Communis Leaf Extract',
  'Rivea Corymbosa Extract','Rohdea Japonica Extract',
  'Rosmarinus Officinalis Leaf Water','Ruellia Tuberosa Extract',
  'Rumex Acetosa Extract','Rumex Crispus Root Extract',
  'Ruta Graveolens Extract','Sabal Serrulata Fruit Extract',
  'Saccharum Officinarum Extract','Sageretia Theezans Extract',
  'Sagittaria Latifolia Extract','Salacia Reticulata Extract',
  'Salix Caprea Extract','Salvia Apiana Extract',
  'Salvia Divinorum Extract','Salvia Lavandulifolia Oil',
  'Salvia Pratensis Extract','Sambucus Ebulus Extract',
  'Sanguinaria Canadensis Extract','Sansevieria Cylindrica Extract',
  'Santolina Chamaecyparissus Extract','Sapindus Saponaria Fruit Extract',
  'Saponaria Officinalis Extract','Sarcocephalus Latifolius Extract',
  'Sarracenia Purpurea Extract','Sassafras Albidum Bark Extract',
  'Satureja Hortensis Extract','Saussurea Costus Root Extract',
  'Saxifraga Stolonifera Extract','Scaevola Taccada Extract',
  'Schefflera Heptaphylla Extract','Schinus Terebinthifolius Extract',
  'Schizonepeta Tenuifolia Spike Extract','Schoenoplectus Lacustris Extract',
  'Scilla Maritima Extract','Scopolia Carniolica Extract',
  'Scutellaria Galericulata Extract','Securidaca Longepedunculata Extract',
  'Selaginella Lepidophylla Extract','Selenicereus Grandiflorus Extract',
  'Sempervivum Tectorum Extract','Senna Alexandrina Leaf Extract',
  'Sequoiadendron Giganteum Extract','Serenoa Repens Fruit Extract',
  'Sida Cordifolia Extract','Sigesbeckia Pubescens Extract',
  'Silene Vulgaris Extract','Sinomenium Acutum Extract',
  'Smilax Aristolochiifolia Extract','Smilax Ornata Root Extract',
  'Solanum Dulcamara Extract','Solanum Nigrum Extract',
  'Solidago Canadensis Extract','Sonchus Oleraceus Extract',
  'Sophora Angustifolia Root Extract','Sorbus Domestica Fruit Extract',
  'Sparganium Stoloniferum Extract','Spatholobus Suberectus Extract',
  'Sphaeranthus Indicus Extract','Sphagnum Magellanicum Extract',
  'Stachys Byzantina Extract','Stachys Lavandulifolia Extract',
  'Stellaria Media Extract','Stemona Tuberosa Root Extract',
  'Stephania Tetrandra Root Extract','Sterculia Foetida Extract',
  'Sticta Pulmonaria Extract','Stillingia Sylvatica Root Extract',
  'Stokesia Laevis Extract','Strobilanthes Cusia Extract',
  'Strychnos Nux-Vomica Extract','Styrax Officinalis Extract',
  'Swertia Japonica Extract','Syzygium Cumini Seed Extract',
  'Tabebuia Impetiginosa Bark Extract','Tagetes Lucida Extract',
  'Talinum Paniculatum Extract','Tamus Communis Extract',
  'Taxodium Distichum Extract','Taxus Baccata Extract',
  'Tecomella Undulata Extract','Telfairia Occidentalis Extract',
  'Tephroseris Kirilowii Extract','Terminalia Bellirica Fruit Extract',
  'Tetracera Scandens Extract','Tetradium Ruticarpum Extract',
  'Tetrapanax Papyrifer Extract','Teucrium Polium Extract',
  'Thaumatococcus Daniellii Extract','Thevetia Peruviana Extract',
  'Thuja Occidentalis Extract','Thymelaea Hirsuta Extract',
  'Thymus Serpyllum Extract','Tilia Europaea Flower Extract',
  'Tinospora Sinensis Extract','Toddalia Asiatica Extract',
  'Toona Sinensis Extract','Torenia Fournieri Extract',
  'Torreya Nucifera Seed Extract','Trachelospermum Jasminoides Extract',
  'Tradescantia Pallida Extract','Trema Orientalis Extract',
  'Tribulus Cistoides Extract','Trichosanthes Kirilowii Root Extract',
  'Trifolium Alexandrinum Extract','Trigonella Foenum-Graecum Leaf Extract',
  'Trillium Grandiflorum Extract','Tripterygium Wilfordii Extract',
  'Trollius Chinensis Extract','Tropaeolum Tuberosum Extract',
  'Tulbaghia Violacea Extract','Turbina Corymbosa Extract'
].map(n => ({
  inci_name: n, ingredient_group: 'Rare Botanical', origin_type: 'natural',
  function_summary: 'Nadir bitkisel ekstre; özel biyoaktif bileşenler içerir, antioksidan ve koruyucu etki sağlar.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// Additional Emollients/Oils (~200 more)
const moreEmollients = [
  'Cyperus Esculentus Tuber Oil','Lallemantia Iberica Seed Oil',
  'Lepidium Sativum Seed Oil','Linum Usitatissimum Oil',
  'Macadamia Ternifolia Seed Oil','Melia Azadirachta Seed Oil',
  'Myristica Fragrans Seed Oil','Olea Europaea Seed Oil',
  'Oryza Sativa Germ Oil','Papaver Somniferum Seed Oil',
  'Perilla Ocymoides Seed Oil','Persea Gratissima Fruit Oil',
  'Phoenix Dactylifera Seed Oil','Pistacia Vera Seed Oil',
  'Plukenetia Volubilis Seed Oil','Pongamia Glabra Seed Oil',
  'Prunus Domestica Seed Oil','Sapindus Mukorossi Peel Oil',
  'Sesamum Indicum Oil','Shorea Stenoptera Seed Butter',
  'Simmondsia Chinensis Oil','Sorbitan Sesquiisostearate',
  'Steareth-100','Steareth-10','Steareth-4',
  'Theobroma Grandiflorum Seed Butter','Torreya Nucifera Seed Oil',
  'Trichilia Emetica Seed Oil','Triticum Vulgare Seed Oil',
  'Undecylenic Acid Glyceride','Vaccinium Myrtillus Seed Oil',
  'Vernicia Fordii Oil','Vernonia Galamensis Seed Oil',
  'Vetiveria Zizanoides Root Oil','Vitex Agnus-Castus Seed Oil',
  'Vitis Vinifera Seed Oil','Xanthium Sibiricum Fruit Oil',
  'Ximenia Americana Kernel Oil','Zanthoxylum Piperitum Fruit Oil',
  'Zea Mays Germ Oil','Zingiber Officinale Root Oil',
  'Butyl Stearate','Cetyl Octanoate','Cetyl Stearate',
  'Decyl Oleate','Dibutyl Lauroyl Glutamide','Dibutyl Ethylhexanoyl Glutamide',
  'Diethylhexyl Adipate','Diethylhexyl Maleate','Diethylhexyl Succinate',
  'Diisopropyl Dimer Dilinoleate','Diisopropyl Sebacate',
  'Dioctyl Malate','Dipentaerythrityl Hexahydroxystearate/Hexastearate/Hexarosinate',
  'Ethylhexyl Cocoate','Ethylhexyl Hydroxystearate','Ethylhexyl Isononanoate',
  'Ethylhexyl Olivate','Glyceryl Diisostearate','Glyceryl Trioctanoate',
  'Hexyldecanol','Hexyldecyl Laurate','Hexyldecyl Stearate',
  'Isocetyl Behenate','Isocetyl Ethylhexanoate','Isocetyl Isostearate',
  'Isocetyl Myristate','Isocetyl Salicylate','Isocetyl Stearate',
  'Isodecyl Citrate','Isodecyl Ethylhexanoate','Isodecyl Hydroxystearate',
  'Isodecyl Isononanoate','Isodecyl Palmitate','Isodecyl Stearate',
  'Isononyl Isononanoate','Isopropyl Lanolate','Isopropyl Laurate',
  'Isopropyl Linoleate','Isopropyl Oleate','Isopropyl Stearate',
  'Isostearyl Alcohol','Isostearyl Benzoate','Isostearyl Erucate',
  'Isostearyl Glyceryl Pentaerythrityl Ether','Isostearyl Isostearate',
  'Isostearyl Laurate','Isostearyl Palmitate','Isotridecyl Isononanoate',
  'Lauryl Lactate','Methyl Palmitate','Methyl Stearate','Myristyl Lactate',
  'Myristyl Stearate','Neopentyl Glycol Diheptanoate',
  'Neopentyl Glycol Diisostearate','Neopentyl Glycol Dilaurate',
  'Octyldodecanol','Octyldodecyl Neopentanoate','Octyldodecyl Stearate',
  'Oleyl Alcohol','Oleyl Erucate','Oleyl Oleate',
  'Pentaerythrityl Distearate','Pentaerythrityl Rosinate',
  'Pentaerythrityl Tetracaprylate/Tetracaprate','Pentaerythrityl Tetrabehenate',
  'PPG-3 Benzyl Ether Ethylhexanoate','PPG-14 Lauryl Ether',
  'PPG-2 Isoceteth-20 Acetate','PPG-3 Hydrogenated Castor Oil',
  'Propylene Glycol Caprylate','Propylene Glycol Laurate',
  'Propylene Glycol Myristate','Propylene Glycol Oleate',
  'Propylene Glycol Ricinoleate','Propylene Glycol Stearate',
  'Stearyl Behenate','Stearyl Dimethicone','Stearyl Glycyrrhetinate',
  'Stearyl Octanoate','Tridecyl Isononanoate','Tridecyl Laurate',
  'Tridecyl Myristate','Tridecyl Octanoate','Tridecyl Salicylate',
  'Undecylenoyl Glycine','Undecylenoyl Phenylalanine',
  'C18-36 Acid Triglyceride','C10-30 Cholesterol/Lanosterol Esters',
  'Diheptyl Succinate/Capryloyl Glycerin/Sebacic Acid Copolymer',
  'Polyhydroxystearic Acid','Hydroxystearic Acid',
  'Isononyl Isononanoate','Isostearyl Behenate',
  'C12-15 Alkyl Ethylhexanoate','C12-15 Alkyl Octanoate',
  'C12-15 Alkyl Salicylate','C12-20 Acid PEG-8 Ester',
  'Myristyl Alcohol','Oleyl Linoleate','Capryloyl Salicylic Acid',
  'Behenic Acid','Brassidic Acid','Nervonic Acid','Gondoic Acid',
  'Arachidonic Acid','Eicosapentaenoic Acid','Docosahexaenoic Acid',
  'Conjugated Linoleic Acid','Gamma-Linolenic Acid','Alpha-Linolenic Acid',
  'Stearidonic Acid','Calendic Acid','Punicic Acid',
  'Catalpic Acid','Eleostearic Acid','Jacaric Acid',
  'Pinolenic Acid','Podocarpic Acid','Juniperonic Acid',
  'Chaulmoogric Acid','Hydnocarpic Acid','Gorlic Acid',
  'Licanic Acid','Oiticica Oil','Isano Oil',
  'Tung Oil','Perilla Oil','Linseed Oil',
  'Walnut Oil','Poppyseed Oil','Sapote Oil',
  'Pracaxi Seed Oil','Ucuuba Seed Butter','Murumuru Seed Butter',
  'Tucuma Seed Butter','Pataua Oil','Andiroba Oil',
  'Copaiba Oil','Babassu Oil','Brazil Nut Oil',
  'Acai Berry Oil','Buriti Fruit Oil','Cupuacu Seed Butter',
  'Bacuri Seed Butter','Mango Butter','Kokum Seed Butter',
  'Shea Olein','Shea Stearin','Palm Olein','Palm Stearin',
  'Coconut Fractionated Oil','MCT Oil','Caprylic Acid','Capric Acid',
  'Tridecylic Acid','Pentadecylic Acid','Margaric Acid','Nonadecylic Acid'
].map(n => ({
  inci_name: n, ingredient_group: 'Emollient', origin_type: 'natural',
  function_summary: 'Yumuşatıcı/yağ; cildi yumuşatır, pürüzsüzleştirir ve nem kaybını önler.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// Additional Surfactants (~100 more)
const moreSurfactants = [
  'Sodium Cocoyl Glycinate','Potassium Lauroyl Sarcosinate',
  'Sodium Palmate Kernelate','TEA-Dodecylbenzenesulfonate',
  'Ammonium Cocoyl Sulfate','Sodium Decyl Sulfate',
  'Sodium Octyl Sulfate','Magnesium Laureth Sulfate',
  'Zinc Coceth Sulfate','Potassium Lauryl Sulfate',
  'Disodium Cocoyl Isethionate','Sodium Methyl 2-Sulfolaurate',
  'Sodium 2-Sulfolaurate','Sodium Alpha-Olefin Sulfonate',
  'Sodium Deceth Sulfate','Sodium Nonoxynol-6 Phosphate',
  'Sodium Trideceth-3 Sulfate','Sodium Trideceth-7 Carboxylate',
  'Sodium C8-14 Alkyl Sulfonate','Sodium C12-18 Alkyl Sulfate',
  'TEA-Laureth Sulfate','MEA-Laureth Sulfate',
  'Diethanolamine Cetyl Sulfate','Triethanolamine Oleyl Sulfate',
  'Sodium Lauroyl Methyl Aminopropionate','Sodium Myristoyl Glutamate',
  'Sodium Palmitoyl Sarcosinate','Sodium Stearoyl Glutamate',
  'Potassium Myristoyl Glutamate','Potassium Lauroyl Glutamate',
  'TEA-Cocoyl Glutamate','TEA-Lauroyl Sarcosinate',
  'Cocamidopropylamine Oxide','Lauramine Oxide',
  'Myristamine Oxide','Cetamine Oxide','Stearamine Oxide',
  'Cocamide Methyl MEA','Lauramide MEA','Oleamide MEA',
  'Stearamide MEA','Palmitamide MEA','Myristamide MEA',
  'PEG-3 Cocamide','PEG-4 Lauramide','PEG-5 Cocamide',
  'PEG-6 Cocamide','PEG-11 Cocamide','PEG-20 Cocamide',
  'Glycol Distearate','Glycol Stearate','Glycol Stearate SE',
  'PEG-3 Distearate','PEG-4 Distearate','PEG-8 Distearate',
  'PEG-120 Methyl Glucose Dioleate','PEG-150 Distearate',
  'PEG-200 Hydrogenated Glyceryl Palmate','PEG-7 Olivate',
  'Polyglyceryl-3 Caprate','Polyglyceryl-4 Cocoate',
  'Polyglyceryl-6 Dicaprate','Polyglyceryl-10 Diisostearate',
  'C11-15 Pareth-3','C11-15 Pareth-7','C11-15 Pareth-12',
  'C11-15 Pareth-20','C11-15 Pareth-40',
  'Nonoxynol-4','Nonoxynol-9','Nonoxynol-10','Nonoxynol-12',
  'Octoxynol-9','Octoxynol-12','Octoxynol-40',
  'Trideceth-3','Trideceth-6','Trideceth-10','Trideceth-12',
  'Trideceth-15','Trideceth-20','Trideceth-50',
  'Oleth-3','Oleth-5','Oleth-10','Oleth-20','Oleth-50',
  'Isoceteth-10','Isoceteth-20','Isoceteth-30',
  'Isosteareth-2','Isosteareth-10','Isosteareth-20','Isosteareth-50',
  'Laneth-5','Laneth-10','Laneth-15','Laneth-20',
  'Steareth-5','Steareth-10','Steareth-15','Steareth-25',
  'Steareth-30','Steareth-40','Steareth-50','Steareth-100',
  'Ceteth-1','Ceteth-2','Ceteth-5','Ceteth-10','Ceteth-15','Ceteth-25','Ceteth-30',
  'Myreth-2','Myreth-3','Myreth-5','Myreth-10'
].map(n => ({
  inci_name: n, ingredient_group: 'Surfactant', origin_type: 'synthetic',
  function_summary: 'Yüzey aktif madde; temizleme, köpürtme ve emülsiyon oluşturma işlevi görür.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// Additional Emulsifiers (~80 more)
const moreEmulsifiers = [
  'PEG-10 Sunflower Glycerides','PEG-10 Olive Glycerides',
  'PEG-10 Rapeseed Glycerides','PEG-15 Cocamine',
  'PEG-20 Almond Glycerides','PEG-25 Hydrogenated Castor Oil',
  'PEG-30 Castor Oil','PEG-35 Castor Oil','PEG-36 Castor Oil',
  'PEG-40 Castor Oil','PEG-50 Castor Oil','PEG-54 Castor Oil',
  'PEG-55 Propylene Glycol Oleate','PEG-60 Almond Glycerides',
  'PEG-60 Corn Glycerides','PEG-60 Evening Primrose Glycerides',
  'PEG-75 Cocoa Butter Glycerides','PEG-75 Shea Butter Glycerides',
  'PEG-80 Glyceryl Cocoate','PEG-80 Jojoba Acid',
  'PEG-80 Jojoba Alcohol','PEG-120 Jojoba Acid',
  'Polyglyceryl-2 Laurate','Polyglyceryl-2 Caprate',
  'Polyglyceryl-2 Oleate','Polyglyceryl-2 Stearate',
  'Polyglyceryl-3 Caprylate','Polyglyceryl-3 Cetyl Ether',
  'Polyglyceryl-3 Decyltetradecanol','Polyglyceryl-3 Laurate',
  'Polyglyceryl-3 Oleate','Polyglyceryl-3 Palmitate',
  'Polyglyceryl-4 Caprate','Polyglyceryl-4 Laurate',
  'Polyglyceryl-4 Oleate','Polyglyceryl-4 Stearate',
  'Polyglyceryl-5 Oleate','Polyglyceryl-5 Stearate',
  'Polyglyceryl-6 Caprylate','Polyglyceryl-6 Laurate',
  'Polyglyceryl-6 Oleate','Polyglyceryl-6 Stearate',
  'Polyglyceryl-8 Oleate','Polyglyceryl-8 Stearate',
  'Polyglyceryl-10 Dioleate','Polyglyceryl-10 Eicosanedioate',
  'Polyglyceryl-10 Mono/Dioleate','Polyglyceryl-10 Pentaoleate',
  'Polyglyceryl-10 Pentastearate','Polyglyceryl-10 Trioleate',
  'PEG-2 Soyamine','PEG-5 Soy Sterol','PEG-10 Soy Sterol',
  'PEG-2 Stearate','PEG-4 Stearate','PEG-6 Stearate',
  'PEG-8 Stearate','PEG-10 Stearate','PEG-12 Stearate',
  'PEG-15 Stearate','PEG-20 Stearate','PEG-25 Stearate',
  'PEG-30 Stearate','PEG-32 Stearate','PEG-40 Stearate',
  'PEG-45 Stearate','PEG-50 Stearate','PEG-55 Stearate',
  'PEG-75 Stearate','PEG-100 Stearate','PEG-150 Stearate',
  'Sucrose Distearate','Sucrose Polystearate','Sucrose Tristearate',
  'Sucrose Tetrastearate Triacetate','Sucrose Dilaurate',
  'Methyl Glucose Distearate','Methyl Glucose Laurate',
  'Methyl Glucose Isostearate','Methyl Glucose Stearate',
  'Propylene Glycol Isostearate','Propylene Glycol Oleate SE',
  'Propylene Glycol Stearate SE','Propylene Glycol Dioleate'
].map(n => ({
  inci_name: n, ingredient_group: 'Emulsifier', origin_type: 'synthetic',
  function_summary: 'Emülgatör; yağ ve su fazlarını bir arada tutarak stabil karışım oluşturur.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// Additional Vitamins (~50 more)
const moreVitamins = [
  'Retinyl Soyate','Retinyl Hydroxypinacolone',
  'Dihydroretinol','All-Trans Retinoic Acid','Isotretinoin',
  'Tretinoin','Tazarotene','Adapalene',
  'Ascorbyl Propyl Hyaluronate','Ascorbyl Tocopheryl Maleate',
  'Ascorbic Acid 2-Glucoside','Ascorbyl Methylsilanol Hyaluronate',
  'L-Ascorbic Acid 6-Palmitate','L-Ascorbic Acid 2-Phosphate',
  'Sodium Ascorbate','Calcium Ascorbate','Potassium Ascorbate',
  'Magnesium Ascorbate','Zinc Ascorbate','Chromium Ascorbate',
  'Tocotrienyl Tocopheryl Acetate','Tocoretinate',
  'Tocopheryl Succinate','Tocopheryl Phosphate Sodium',
  'Alpha-Tocopheryl Acetate','Gamma-Tocopheryl Acetate',
  'D-Alpha-Tocopheryl Polyethylene Glycol Succinate','TPGS',
  'Retinyl N-Formyl Aspartamate','Retinyl Ascorbate',
  'Pyridoxine HCl','Pyridoxamine','Pyridoxal',
  'Thiamine Nitrate','Thiamine Disulfide','Benfotiamine',
  'Riboflavin 5-Phosphate','Flavin Adenine Dinucleotide',
  'Nicotinamide Adenine Dinucleotide','NAD',
  'Calcium D-Pantothenate','Dexpanthenol Acetate',
  'Pantethine','Pantetheine','Hopantenic Acid',
  'D-Biotin Methylester','Biocytin',
  'Folinic Acid','Methyltetrahydrofolic Acid',
  'Hydroxocobalamin','Adenosylcobalamin','Cobamamide',
  'Mecobalamin','Methylcobalamin HCl'
].map(n => ({
  inci_name: n, ingredient_group: 'Vitamin/Antioxidant', origin_type: 'synthetic',
  function_summary: 'Antioksidan/vitamin; serbest radikallere karşı koruma ve cilt yenilenmesini destekler.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// Additional Peptides (~50 more)
const morePeptides = [
  'Palmitoyl Pentapeptide-3','Palmitoyl Dipeptide-7',
  'Palmitoyl Tetrapeptide-50','Palmitoyl Tripeptide-58',
  'Palmitoyl Hexapeptide-19','Palmitoyl Octapeptide-3',
  'Palmitoyl Decapeptide-25','Palmitoyl Dipeptide-18',
  'Acetyl Decapeptide-3','Acetyl Hexapeptide-37',
  'Acetyl Hexapeptide-49','Acetyl Hexapeptide-51 Amide',
  'Acetyl Octapeptide-5','Acetyl Nonapeptide-1',
  'Acetyl Tetrapeptide-17','Acetyl Tetrapeptide-40',
  'Myristoyl Hexapeptide-4','Myristoyl Hexapeptide-23',
  'Myristoyl Octapeptide-1','Myristoyl Decapeptide-15',
  'Caprooyl Tetrapeptide-3','Hexanoyl Dipeptide-3',
  'Palmitoyl Glycine','Lauroyl Lysine','Myristoyl Glycine',
  'Stearoyl Glycine','Capryloyl Glycyl-Aspartic Acid',
  'Copper Lys-His-Gly','Manganese Tripeptide-1',
  'Zinc Tripeptide-1','Iron Tripeptide-1',
  'Signal Peptide','Carrier Peptide','Neurotransmitter Inhibitor Peptide',
  'Enzyme Inhibitor Peptide','Structural Peptide',
  'Collagen Peptide','Elastin Peptide','Fibronectin Peptide',
  'Laminin Peptide','Keratin Peptide',
  'Thymosin Beta-4','Thymulin','Thymopoietin Fragment',
  'Melanostatin','Melittin Fragment',
  'Kallidin','Bradykinin Fragment','Substance P Fragment',
  'Oxytocin Fragment','Vasopressin Fragment',
  'Somatostatin Fragment','Growth Hormone Fragment',
  'Insulin-Like Peptide','Epidermal Growth Peptide'
].map(n => ({
  inci_name: n, ingredient_group: 'Peptide', origin_type: 'biotech',
  function_summary: 'Peptit; kolajen sentezini uyarır, kırışıklık azaltıcı ve cilt sıkılaştırıcı etki gösterir.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// Additional Silicones (~40 more)
const moreSilicones = [
  'Dimethicone/Methicone Copolymer','Dimethicone/Vinyl Trimethylsiloxysilicate Crosspolymer',
  'Stearyl Methicone','Isododecyl Dimethicone',
  'C30-45 Alkyl Methicone','C24-28 Alkyl Methicone','C26-28 Alkyl Dimethicone',
  'Cetyl Dimethicone Copolyol','Lauryl Methicone Copolyol',
  'PEG-9 Dimethicone','PEG-11 Methyl Ether Dimethicone',
  'PEG-14 Dimethicone','PEG-7 Amodimethicone',
  'Bis-Aminopropyl/Dimethicone Copolymer',
  'Aminopropyl Phenyl Trimethicone','Aminopropyl Dimethicone/Methicone Copolymer',
  'Dimethicone/Amodimethicone Copolymer',
  'Vinyl Dimethicone','Hydrogen Dimethicone/Octyl Silsesquioxane Copolymer',
  'Dimethicone PEG-8 Meadowfoamate','Dimethicone PEG-8 Beeswax',
  'Dimethicone PEG-7 Avocadoate','Dimethicone PEG-10 Olivate',
  'Silicone Quaternium-1','Silicone Quaternium-2',
  'Silicone Quaternium-3','Silicone Quaternium-8',
  'Silicone Quaternium-16','Silicone Quaternium-17',
  'Polysilicone-1','Polysilicone-2','Polysilicone-4',
  'Polysilicone-5','Polysilicone-6','Polysilicone-7',
  'Polysilicone-8','Polysilicone-10','Polysilicone-13',
  'Polysilicone-18','Polysilicone-19','Polysilicone-20',
  'Polysilicone-31','Trifluoropropyl Methyl Cyclotrisiloxane',
  'Octamethyltrisiloxane','Decamethyltetrasiloxane','Dodecamethylpentasiloxane'
].map(n => ({
  inci_name: n, ingredient_group: 'Silicone', origin_type: 'synthetic',
  function_summary: 'Silikon; ipeksi doku, nem koruma ve saç/cilt yüzeyini pürüzsüzleştirme sağlar.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// Additional Actives (~100 more)
const moreActives = [
  'Palmitoyl Tripeptide-1/Tetrapeptide-7 Complex','Matrixyl Morphomics',
  'Haloxyl','Eyeliss','Eyeseryl','Regu-Age','Syn-Ake','Leuphasyl',
  'Vialox','SNAP-7','Decorinyl','Preventhelia',
  'Liftonin','Gatuline Expression','Gatuline In-Tense',
  'Beautifeye','Skinasensyl','Adipofill','Adipoless',
  'Liporeductyl','Phytosonic','Slim-Excess',
  'Siluet','Body 3 Complex','Bodyfit',
  'Cellu-Fix','Elestan','Collalift',
  'Bioxilift','Dermaxyl','Instensyl',
  'Diffuporine','Hydractin','Hydraporine',
  'Aquaxylem','Aquaphyline','Hydrasensyl',
  'Phytovie','Phytocohesine','Phytoquintescine',
  'Phytocelltec Argan','Phytocelltec Solar Vitis',
  'Phytocelltec Symphytum','Phytocelltec Goji',
  'Phytocelltec Nunatak','Phytocelltec Alpenrose',
  'Aqua Shuttle','Marine Shuttle','Vegetal Shuttle',
  'Sepicalm S','Sepicalm VG','Sepiwhite MSH',
  'Sepicontrol A5','Sepitonic M3','Sepilift DPHP',
  'Sepivinol','Sepimax Zen','Sepinov EMT 10',
  'Olivem 1000','Olivem 900','Olivem 2020',
  'Botanykem AO-E','Botanykem AO-N','Botanykem White AQ',
  'Uniprosyn PS-18','Proteasyl PV','Proteasyl TP',
  'Lanablue','Grevilline','Progeline',
  'Sesaflash','Densiskin','Aldavine 5x',
  'Majestem','Neodermyl','Syn-Hycan',
  'Syn-Coll','Syn-Tacks','Syn-Star',
  'Syn-Glow','Syn-Up','Syn-TC',
  'Ameliox','Antarcticine','Detoxilyn',
  'Pollushield','Urban D-Tox','Blue Light Defense',
  'Infraguard','Liposhield','Photolyase',
  'Endonuclease','Oxo-Reductase','DNA Repair Complex',
  'Photorepair Complex','CPD Photolyase','6-4 Photolyase',
  'AGE Breaker','Alistin','Carotenoid Complex',
  'Ceramide Complex','Lipid Bilayer Complex','NMF Complex',
  'Moisture Surge','Hydra-Depot','Time-Arrest',
  'Bio-Retinol','Phyto-Retinol','Gentle Retinol',
  'Encapsulated Retinol','Hydroxypinacolone Retinoate',
  'Granactive Retinoid','Retinoid Complex'
].map(n => ({
  inci_name: n, ingredient_group: 'Active', origin_type: 'biotech',
  function_summary: 'Aktif madde; hedefe yönelik bakım etkisi sağlayan özel kozmetik bileşen.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// Additional Essential Oils (~50 more)
const moreEssentialOils = [
  'Abies Alba Needle Oil','Achillea Ligustica Oil',
  'Acorus Calamus Root Oil','Allspice Berry Oil',
  'Alpinia Officinarum Oil','Amyris Balsamifera Oil',
  'Angelica Root Oil','Anise Seed Oil',
  'Balm Mint Oil','Bay Laurel Oil',
  'Benzoin Resin Oil','Birch Tar Oil',
  'Black Pepper Oil','Black Spruce Oil',
  'Blue Tansy Oil','Cabreuva Oil',
  'Cade Oil','Cajeput Oil',
  'Calamus Oil','Camphor White Oil',
  'Cape Chamomile Oil','Caraway Seed Oil',
  'Cassia Oil','Celery Seed Oil',
  'Citronella Oil','Clary Sage Oil',
  'Clove Bud Oil','Copaiba Oil',
  'Cornmint Oil','Costus Root Oil',
  'Cubeb Oil','Curry Leaf Oil',
  'Dill Seed Oil','Elemi Oil',
  'Fennel Sweet Oil','Fir Balsam Oil',
  'Galbanum Oil','Geranium Bourbon Oil',
  'Ginger Lily Oil','Goldenrod Oil',
  'Guaiacwood Oil','Helichrysum Oil',
  'Ho Wood Oil','Hops Oil',
  'Huon Pine Oil','Hyssop Oil',
  'Inula Oil','Kanuka Oil',
  'Labdanum Oil','Lantana Oil'
].map(n => ({
  inci_name: n, ingredient_group: 'Essential Oil', origin_type: 'natural',
  function_summary: 'Uçucu yağ; aromaterapi, antimikrobiyal ve cildi rahatlatıcı özellik taşır.',
  allergen_flag: true, fragrance_flag: true, preservative_flag: false,
  sensitivity_note: 'Uçucu yağlar hassas ciltlerde tahrişe neden olabilir. Seyrelterek kullanılmalıdır.'
}));

// Additional Thickeners (~50 more)
const moreThickeners = [
  'Sodium Carboxymethyl Starch','Hydroxypropyl Starch Phosphate',
  'Acetylated Starch','Oxidized Starch','Pregelatinized Starch',
  'Starch Acetate','Starch Phosphate','Distarch Phosphate',
  'Hydroxypropyl Distarch Phosphate','Phosphated Distarch Phosphate',
  'Acetylated Distarch Adipate','Acetylated Distarch Phosphate',
  'Starch Sodium Octenyl Succinate','Dextrin Palmitate',
  'Sodium Starch Glycolate','Croscarmellose Sodium',
  'Povidone','Copovidone','Crospovidone',
  'Hydroxypropyl Methylcellulose Acetate Succinate','HPMCAS',
  'Cellulose Acetate Phthalate','Cellulose Acetate Butyrate',
  'Ethyl Cellulose','Methyl Ethyl Cellulose',
  'Sodium Alginate','Calcium Alginate','Propylene Glycol Alginate',
  'Ammonium Alginate','Potassium Alginate',
  'Gellan Gum Low-Acyl','Gellan Gum High-Acyl',
  'Deacylated Gellan Gum','Welan Gum','Rhamsan Gum',
  'Sphingan','Diutan Gum','Succinoglycan',
  'Curdlan','Schizophyllan','Lentinan',
  'Beta-Glucan','Barley Beta-Glucan','Oat Beta-Glucan',
  'Yeast Beta-Glucan','Mushroom Beta-Glucan','Carvacrol Gum',
  'Konjac Mannan','Glucomannan','Galactomannan',
  'Arabinogalactan','Larch Arabinogalactan',
  'Pectic Galactan','Rhamnogalacturonan',
  'Chitin Nanofibrils','Nanocellulose','Cellulose Nanocrystals',
  'Bacterial Cellulose','Microfibrillated Cellulose'
].map(n => ({
  inci_name: n, ingredient_group: 'Thickener', origin_type: 'natural',
  function_summary: 'Kıvam artırıcı; formülasyona istenilen viskozite ve dokuyu kazandırır.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// Additional Fermentation (~30 more)
const moreFermentation = [
  'Lactobacillus/Kelp Ferment Filtrate','Lactobacillus/Wasabia Japonica Root Ferment Extract',
  'Lactobacillus/Soybean/Fenugreek Ferment Extract','Lactobacillus/Portulaca Oleracea Ferment Extract',
  'Lactobacillus/Centella Asiatica Ferment Filtrate','Lactobacillus/Panax Ginseng Root Ferment Filtrate',
  'Lactobacillus/Aloe Barbadensis Ferment Filtrate','Lactobacillus/Punica Granatum Ferment Extract',
  'Saccharomyces/Viscum Album Ferment Extract','Saccharomyces/Imperata Cylindrica Root Ferment Extract',
  'Saccharomyces/Xylinum/Black Tea Ferment','Aspergillus/Saccharomyces/Rice Bran Ferment Filtrate',
  'Lactobacillus/Trapa Japonica Fruit Ferment Filtrate','Lactobacillus/Calamine Ferment Filtrate',
  'Bifida/Lactobacillus/Streptococcus Ferment','Lactobacillus/Salix Alba Bark Ferment Filtrate',
  'Saccharomyces/Camellia Sinensis Leaf Ferment Filtrate','Pichia/Hyaluronic Acid Ferment Extract',
  'Bacillus/Rice Bran Ferment Filtrate','Aspergillus/Soybean Seed Ferment Extract',
  'Lactobacillus/Honey Ferment Lysate','Saccharomyces/Propolis Ferment Extract',
  'Lactobacillus/Tomato Fruit Ferment Extract','Streptococcus/Ferulic Acid Ferment',
  'Bacillus/Natto Ferment Filtrate','Rhizopus/Rice Ferment Extract',
  'Aspergillus Niger/Rice Ferment Extract Filtrate','Aspergillus Oryzae/Rice Ferment Filtrate',
  'Pediococcus/Hyaluronic Acid Ferment Filtrate','Leuconostoc/Grape Ferment Extract'
].map(n => ({
  inci_name: n, ingredient_group: 'Fermentation', origin_type: 'biotech',
  function_summary: 'Fermentasyon ürünü; mikrobiyal fermantasyonla elde edilen biyoaktif bileşenler içerir.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// Additional Colorants (~50 more)
const moreColorants = [
  'CI 10006','CI 10020','CI 10316','CI 11680','CI 11710',
  'CI 11725','CI 11920','CI 12010','CI 12075','CI 12120',
  'CI 12150','CI 12370','CI 12420','CI 12480','CI 12490',
  'CI 12700','CI 13015','CI 13065','CI 14270','CI 14700',
  'CI 14720','CI 14815','CI 15510','CI 15525','CI 15580',
  'CI 15620','CI 15630','CI 15800','CI 15880','CI 15980',
  'CI 16185','CI 16230','CI 16255','CI 16290','CI 17200',
  'CI 18050','CI 18130','CI 18690','CI 18736','CI 18820',
  'CI 18965','CI 19140','CI 20040','CI 20170','CI 20470',
  'CI 21100','CI 21108','CI 21110','CI 21230','CI 24790'
].map(n => ({
  inci_name: n, ingredient_group: 'Colorant', origin_type: 'synthetic',
  function_summary: 'Renklendirici; kozmetik ürünlere renk ve estetik görünüm kazandırır.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// Additional Amino Acids (~30)
const moreAminoAcids = [
  'N-Acetyl-L-Cysteine','N-Acetyl-L-Tyrosine','N-Acetyl-L-Carnitine',
  'N-Acetyl-L-Methionine','N-Acetyl-L-Glutamine','N-Acetyl-L-Proline',
  'N-Formyl-L-Methionine','S-Adenosyl-L-Methionine','Phosphoserine',
  'Phosphothreonine','Phosphotyrosine','4-Hydroxyproline',
  '5-Hydroxylysine','3-Methylhistidine','1-Methylhistidine',
  'Dehydroalanine','Lanthionine','Djenkolic Acid',
  'Felinine','Thialysine','Selenocystine',
  'Citrulline Malate','Arginine Alpha-Ketoglutarate','Glutamine Alpha-Ketoglutarate',
  'Ornithine Alpha-Ketoglutarate','Lysine Alpha-Ketoglutarate',
  'Aspartate Aminotransferase','Alanine Aminotransferase',
  'Branched Chain Amino Acids','Essential Amino Acid Complex'
].map(n => ({
  inci_name: n, ingredient_group: 'Amino Acid', origin_type: 'synthetic',
  function_summary: 'Amino asit; cildin doğal nem faktörünün (NMF) yapı taşı, nemlendirici ve onarıcı.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// Additional Minerals (~30)
const moreMinerals = [
  'Zinc Picolinate','Zinc Bisglycinate','Zinc Carnosine',
  'Copper Bisglycinate','Copper Histidinate','Iron Bisglycinate',
  'Manganese Bisglycinate','Chromium Polynicotinate','Selenium Methionine',
  'Boron Glycinate','Molybdenum Glycinate','Vanadyl Bisglycinate',
  'Magnesium Threonate','Magnesium Taurate','Magnesium Bisglycinate',
  'Calcium Hydroxyapatite','Strontium Ranelate','Lithium Orotate',
  'Rubidium Chloride','Cesium Chloride','Germanium Sesquioxide',
  'Lanthanum Carbonate','Iridium Oxide','Rhodium Oxide',
  'Palladium Nanoparticles','Gold Nanoparticles','Silver Nanoparticles',
  'Platinum Nanoparticles','Copper Nanoparticles','Zinc Nanoparticles'
].map(n => ({
  inci_name: n, ingredient_group: 'Mineral', origin_type: 'mineral',
  function_summary: 'Mineral; cilde gerekli mineralleri sağlar, arındırıcı veya koruyucu etki gösterir.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// Additional Ceramides (~30)
const moreCeramides = [
  'Ceramide 1A','Ceramide 2A','Ceramide 3A','Ceramide 4',
  'Ceramide 5','Ceramide 7','Ceramide 8','Ceramide 10',
  'Hexadecasphinganine','Tetraacetyl Phytosphingosine',
  'N-Lauroyl-L-Glutamic Acid Di-Butylamide','N-Lauroyl-L-Glutamic Acid Di-Hexyldecyl Ester',
  'Ceramide PC-104','Ceramide PC-108','Ceramide SLN-230',
  'Hydroxypalmitamide MEA','Stearamide MEA','Palmitamide MEA',
  'Oleamide MEA','Erucamide MEA','Behenamide MEA',
  'N-Stearoyl-L-Glutamic Acid','N-Lauroyl-L-Lysine','N-Palmitoyl-L-Proline',
  'N-Capryloyl Phytosphingosine','N-Hexanoyl Sphingosine',
  'N-Stearoyl Dihydrosphingosine','N-Oleyl Dihydrosphingosine',
  'Glycosylphosphatidylinositol','Ganglioside GM1'
].map(n => ({
  inci_name: n, ingredient_group: 'Ceramide/Lipid', origin_type: 'biotech',
  function_summary: 'Seramid/lipit; cilt bariyerini güçlendirir, nem kaybını önler ve onarım sağlar.',
  allergen_flag: false, fragrance_flag: false, preservative_flag: false
}));

// Merge all part2
const allPart2 = [
  ...morePlantExtracts, ...moreRareBotanicals, ...moreEmollients,
  ...moreSurfactants, ...moreEmulsifiers, ...moreVitamins,
  ...morePeptides, ...moreSilicones, ...moreActives,
  ...moreEssentialOils, ...moreThickeners, ...moreFermentation,
  ...moreColorants, ...moreAminoAcids, ...moreMinerals,
  ...moreCeramides
];

console.log(`Part 2 total: ${allPart2.length}`);

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('Connected');

  const seen = new Set();
  const unique = [];
  for (const ing of allPart2) {
    const s = slug(ing.inci_name);
    if (!seen.has(s)) {
      seen.add(s);
      unique.push(ing);
    }
  }
  console.log(`After dedup: ${unique.length}`);

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
        ing.inci_name, s, ing.ingredient_group, ing.origin_type || null,
        ing.function_summary || null, ing.sensitivity_note || null,
        ing.allergen_flag || false, ing.fragrance_flag || false,
        ing.preservative_flag || false, 'cosmetic'
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
  }

  console.log(`\nInserted: ${inserted}, Skipped: ${skipped}`);

  const countResult = await client.query('SELECT COUNT(*) FROM ingredients');
  console.log(`Total in DB: ${countResult.rows[0].count}`);

  const groupResult = await client.query('SELECT ingredient_group, COUNT(*) as cnt FROM ingredients GROUP BY ingredient_group ORDER BY cnt DESC');
  console.log('\nCategory breakdown:');
  for (const row of groupResult.rows) {
    console.log(`  ${row.ingredient_group}: ${row.cnt}`);
  }

  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
