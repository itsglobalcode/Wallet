import xml.etree.ElementTree as ET
import json

# Parse the SVG file
tree = ET.parse('../frontend/assets/world.svg')
root = tree.getroot()

# Extract all path elements with their id and d attributes
countries = []

for path in root.findall('.//{http://www.w3.org/2000/svg}path'):
    country_id = path.get('id')
    country_class = path.get('class')
    path_d = path.get('d')
    country_name = path.get('name')
    
    # Use id if available, otherwise try to extract from class
    if country_id:
        code = country_id
    elif country_class:
        # For paths with class like "Angola", "Argentina", etc.
        # We'll skip these for now as they don't have ISO codes
        continue
    else:
        continue
    
    if path_d:
        countries.append({
            'id': code,
            'name': country_name if country_name else code,
            'd': path_d
        })

# Output as JSON
print(json.dumps(countries, indent=2))
print(f"\nTotal countries extracted: {len(countries)}")
