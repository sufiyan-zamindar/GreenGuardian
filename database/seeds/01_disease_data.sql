-- GreenGuardian Seed Data
-- Disease information and treatments based on trained model

-- Insert Diseases
INSERT INTO diseases (disease_name, scientific_name, category, description) VALUES
-- Apple diseases
('Apple_scab', 'Venturia inaequalis', 'Fruits', 'Fungal infection causing dark lesions on apple leaves and fruit'),
('Apple_Black_rot', 'Botryosphaeria obtusa', 'Fruits', 'Fungal disease causing black rot on apple fruits'),
('Apple_Cedar_apple_rust', 'Gymnosprangium juniperi-virginianae', 'Fruits', 'Fungal disease with yellow-orange lesions'),
('Apple_healthy', 'N/A', 'Fruits', 'Healthy apple plant'),

-- Blueberry
('Blueberry_healthy', 'N/A', 'Berries', 'Healthy blueberry plant'),

-- Cherry diseases
('Cherry_Powdery_mildew', 'Podosphaera celandii', 'Fruits', 'White powdery coating on leaves and fruits'),
('Cherry_healthy', 'N/A', 'Fruits', 'Healthy cherry plant'),

-- Corn diseases
('Corn_Cercospora_leaf_spot', 'Cercospora zeae-maydis', 'Cereals', 'Tan spots with dark rings on corn leaves'),
('Corn_Common_rust', 'Puccinia sorghi', 'Cereals', 'Reddish-brown pustules on corn leaves'),
('Corn_Northern_Leaf_Blight', 'Setosphaeria turcica', 'Cereals', 'Elongated tan lesions on corn leaves'),
('Corn_healthy', 'N/A', 'Cereals', 'Healthy corn plant'),

-- Grape diseases
('Grape_Black_rot', 'Guignardia bidwellii', 'Fruits', 'Dark rot on grape berries and shoots'),
('Grape_Esca', 'Phaeomoniella chlamydospora', 'Fruits', 'Black measles causing cane dieback'),
('Grape_Leaf_blight', 'Isariopsis griseola', 'Fruits', 'Angular leaf spots with water-soaked appearance'),
('Grape_healthy', 'N/A', 'Fruits', 'Healthy grape plant'),

-- Orange diseases
('Orange_Huanglongbing', 'Candidatus Liberibacter asiaticus', 'Fruits', 'Citrus greening disease causing yellow mottling'),

-- Peach diseases
('Peach_Bacterial_spot', 'Xanthomonas campestris', 'Fruits', 'Red spots with yellow halos on peach leaves'),
('Peach_healthy', 'N/A', 'Fruits', 'Healthy peach plant'),

-- Pepper diseases
('Pepper_Bacterial_spot', 'Xanthomonas campestris', 'Vegetables', 'Dark water-soaked lesions on pepper leaves'),
('Pepper_healthy', 'N/A', 'Vegetables', 'Healthy pepper plant'),

-- Potato diseases
('Potato_Early_blight', 'Alternaria solani', 'Vegetables', 'Concentric brown rings on potato leaves'),
('Potato_Late_blight', 'Phytophthora infestans', 'Vegetables', 'Water-soaked lesions on leaves and stems'),
('Potato_healthy', 'N/A', 'Vegetables', 'Healthy potato plant'),

-- Raspberry
('Raspberry_healthy', 'N/A', 'Berries', 'Healthy raspberry plant'),

-- Soybean
('Soybean_healthy', 'N/A', 'Legumes', 'Healthy soybean plant'),

-- Squash
('Squash_Powdery_mildew', 'Podosphaera xanthii', 'Vegetables', 'White powdery coating on squash leaves'),

-- Strawberry diseases
('Strawberry_Leaf_scorch', 'Diplocarpon strawberriae', 'Berries', 'Purple-red lesions on strawberry leaves'),
('Strawberry_healthy', 'N/A', 'Berries', 'Healthy strawberry plant'),

-- Tomato diseases
('Tomato_Bacterial_spot', 'Xanthomonas campestris', 'Vegetables', 'Small dark circular spots on tomato leaves'),
('Tomato_Early_blight', 'Alternaria solani', 'Vegetables', 'Brown lesions with concentric rings on tomato leaves'),
('Tomato_Late_blight', 'Phytophthora infestans', 'Vegetables', 'Water-soaked spots on tomato leaves and fruits'),
('Tomato_Leaf_Mold', 'Passalora fulva', 'Vegetables', 'Yellow spots on upper leaf surface, olive mold below'),
('Tomato_Septoria_leaf_spot', 'Septoria lycopersici', 'Vegetables', 'Small circular spots with dark borders on tomato leaves'),
('Tomato_Spider_mites', 'Tetranychus urticae', 'Vegetables', 'Fine webbing and yellow speckled leaves'),
('Tomato_Target_Spot', 'Corynespora cassiicola', 'Vegetables', 'Brown circular lesions with concentric rings'),
('Tomato_Yellow_Leaf_Curl_Virus', 'Tomato yellow leaf curl virus', 'Vegetables', 'Yellow curling of tomato leaves'),
('Tomato_Mosaic_virus', 'Tomato mosaic virus', 'Vegetables', 'Mottling and mosaic patterns on tomato leaves'),
('Tomato_healthy', 'N/A', 'Vegetables', 'Healthy tomato plant')
ON CONFLICT (disease_name) DO NOTHING;

-- Insert Disease Profiles (Treatment Information)
INSERT INTO disease_profiles (disease_id, symptoms, organic_remedies, chemical_treatments, preventive_measures) VALUES
-- Apple scab
((SELECT id FROM diseases WHERE disease_name = 'Apple_scab'), 
 'Dark olive-green spots on leaves and fruit, gradual browning and corking',
 'Sulfur sprays, neem oil, remove infected leaves',
 'Azoxystrobin, Captan fungicides',
 'Prune trees for air circulation, remove fallen leaves, choose resistant varieties'),

-- Apple Black rot
((SELECT id FROM diseases WHERE disease_name = 'Apple_Black_rot'),
 'Black sunken lesions on fruit, cankers on branches',
 'Pruning infected branches, sulfur dust',
 'Copper fungicides, Azoxystrobin',
 'Remove cankers, improve drainage, avoid wounding trees'),

-- Apple Cedar apple rust
((SELECT id FROM diseases WHERE disease_name = 'Apple_Cedar_apple_rust'),
 'Yellow-orange lesions with tubular projections on fruit',
 'Remove galls from juniper trees nearby, sulfur sprays',
 'Myclobutanil, Trifloxystrobin',
 'Plant away from Juniper trees, apply fungicides preventively'),

-- Tomato Early blight
((SELECT id FROM diseases WHERE disease_name = 'Tomato_Early_blight'),
 'Concentric brown rings on lower tomato leaves, stem cankers',
 'Remove infected leaves, mulch around plants, neem oil spray',
 'Chlorothalonil, Azoxystrobin, Mancozeb',
 'Stake plants for air circulation, drip irrigation, rotate crops'),

-- Tomato Late blight
((SELECT id FROM diseases WHERE disease_name = 'Tomato_Late_blight'),
 'Water-soaked spots on leaves and fruits, white undersurface mold',
 'Copper fungicide, sulfur, remove infected plant parts',
 'Mancozeb, Chlorothalonil, Metalaxyl',
 'Avoid overhead watering, improve ventilation, remove volunteers'),

-- Potato Early blight
((SELECT id FROM diseases WHERE disease_name = 'Potato_Early_blight'),
 'Brown lesions with concentric rings, premature leaf yellowing',
 'Sulfur spray, remove infected leaves, improve drainage',
 'Chlorothalonil, Mancozeb, Penthiopyrad',
 'Improve air circulation, mulch, crop rotation'),

-- Potato Late blight
((SELECT id FROM diseases WHERE disease_name = 'Potato_Late_blight'),
 'Water-soaked lesions on leaves and tubers, white mold on underside',
 'Copper fungicides, sulfur, remove infected plants',
 'Mancozeb, Chlorothalonil, Metalaxyl, Fluazinam',
 'Plant resistant varieties, proper spacing, avoid overhead watering'),

-- Corn Common rust
((SELECT id FROM diseases WHERE disease_name = 'Corn_Common_rust'),
 'Reddish-brown pustules on corn leaves',
 'Sulfur dust, remove infected leaves',
 'Azoxystrobin, Propiconazole',
 'Plant resistant hybrids, manage debris, improve air flow'),

-- Corn Northern Leaf Blight
((SELECT id FROM diseases WHERE disease_name = 'Corn_Northern_Leaf_Blight'),
 'Elongated tan-gray lesions on corn leaves',
 'Sulfur dust, remove crop residue',
 'Azoxystrobin, Pyraclostrobin, Metconazole',
 'Choose resistant cultivars, rotate crops, improve drainage'),

-- Grape Black rot
((SELECT id FROM diseases WHERE disease_name = 'Grape_Black_rot'),
 'Black rot on grapes, reddish-brown spots on leaves',
 'Sulfur spray, remove mummified fruit, pruning',
 'Myclobutanil, Azoxystrobin, Mancozeb',
 'Remove infected fruit clusters, improve air circulation'),

-- Strawberry Leaf scorch
((SELECT id FROM diseases WHERE disease_name = 'Strawberry_Leaf_scorch'),
 'Purple-red lesions on strawberry leaves, leaf yellowing',
 'Remove infected leaves, improve drainage, sulfur dust',
 'Azoxystrobin, Chlorothalonil',
 'Use disease-free plants, proper spacing, avoid overhead watering'),

-- Pepper Bacterial spot
((SELECT id FROM diseases WHERE disease_name = 'Pepper_Bacterial_spot'),
 'Small angular dark spots on pepper leaves and fruits',
 'Remove infected plants, copper fungicide spray',
 'Copper fungicides, Streptomycin',
 'Use disease-free seeds, proper spacing, avoid wounding plants'),

-- Squash Powdery mildew
((SELECT id FROM diseases WHERE disease_name = 'Squash_Powdery_mildew'),
 'White powdery coating on squash leaves',
 'Sulfur dust, neem oil, baking soda spray',
 'Azoxystrobin, Sulfur fungicides',
 'Improve air circulation, avoid overhead watering, remove infected leaves'),

-- Blueberry healthy
((SELECT id FROM diseases WHERE disease_name = 'Blueberry_healthy'),
 'No symptoms - healthy plant',
 'Maintain proper nutrition and watering',
 'No treatment needed',
 'Continue regular care and monitoring'),

-- Generic healthy statuses
((SELECT id FROM diseases WHERE disease_name = 'Apple_healthy'),
 'No symptoms - healthy plant',
 'Maintain proper nutrition and watering',
 'No treatment needed',
 'Continue regular care and monitoring'),
((SELECT id FROM diseases WHERE disease_name = 'Cherry_healthy'),
 'No symptoms - healthy plant',
 'Maintain proper nutrition and watering',
 'No treatment needed',
 'Continue regular care and monitoring'),
((SELECT id FROM diseases WHERE disease_name = 'Grape_healthy'),
 'No symptoms - healthy plant',
 'Maintain proper nutrition and watering',
 'No treatment needed',
 'Continue regular care and monitoring'),
((SELECT id FROM diseases WHERE disease_name = 'Peach_healthy'),
 'No symptoms - healthy plant',
 'Maintain proper nutrition and watering',
 'No treatment needed',
 'Continue regular care and monitoring'),
((SELECT id FROM diseases WHERE disease_name = 'Pepper_healthy'),
 'No symptoms - healthy plant',
 'Maintain proper nutrition and watering',
 'No treatment needed',
 'Continue regular care and monitoring'),
((SELECT id FROM diseases WHERE disease_name = 'Potato_healthy'),
 'No symptoms - healthy plant',
 'Maintain proper nutrition and watering',
 'No treatment needed',
 'Continue regular care and monitoring'),
((SELECT id FROM diseases WHERE disease_name = 'Raspberry_healthy'),
 'No symptoms - healthy plant',
 'Maintain proper nutrition and watering',
 'No treatment needed',
 'Continue regular care and monitoring'),
((SELECT id FROM diseases WHERE disease_name = 'Soybean_healthy'),
 'No symptoms - healthy plant',
 'Maintain proper nutrition and watering',
 'No treatment needed',
 'Continue regular care and monitoring'),
((SELECT id FROM diseases WHERE disease_name = 'Strawberry_healthy'),
 'No symptoms - healthy plant',
 'Maintain proper nutrition and watering',
 'No treatment needed',
 'Continue regular care and monitoring'),
((SELECT id FROM diseases WHERE disease_name = 'Tomato_healthy'),
 'No symptoms - healthy plant',
 'Maintain proper nutrition and watering',
 'No treatment needed',
 'Continue regular care and monitoring'),
((SELECT id FROM diseases WHERE disease_name = 'Corn_healthy'),
 'No symptoms - healthy plant',
 'Maintain proper nutrition and watering',
 'No treatment needed',
 'Continue regular care and monitoring')
ON CONFLICT DO NOTHING;
