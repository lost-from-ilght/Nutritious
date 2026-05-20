import os
import requests

def download_ranks():
    url = "https://valorant-api.com/v1/competitivetiers"
    response = requests.get(url)
    data = response.json()
    
    # The last element in the array usually contains the most up-to-date tiers
    tiers = data['data'][-1]['tiers']
    
    output_dir = r"c:\Users\Tad\nutritrack\frontend\public\ranks"
    os.makedirs(output_dir, exist_ok=True)
    
    for tier in tiers:
        tier_name = tier['tierName']
        # Skip "Unranked" or empty
        if not tier_name or tier_name.lower() == "unranked":
            continue
            
        icon_url = tier.get('largeIcon') or tier.get('smallIcon')
        if not icon_url:
            continue
            
        # Capitalize first letter, replace spaces with underscores
        file_name = f"{tier_name.replace(' ', '_')}_Rank.png".capitalize()
        if tier_name.lower() == 'radiant':
            file_name = "Radiant_Rank.png"
        else:
            parts = tier_name.split(' ')
            if len(parts) > 1:
                file_name = f"{parts[0].capitalize()}_{parts[1]}_Rank.png"
            
        file_path = os.path.join(output_dir, file_name)
        
        print(f"Downloading {file_name}...")
        img_data = requests.get(icon_url).content
        with open(file_path, 'wb') as handler:
            handler.write(img_data)

if __name__ == "__main__":
    download_ranks()
