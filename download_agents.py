import os
import requests

def download_agents():
    url = "https://valorant-api.com/v1/agents?isPlayableCharacter=true"
    response = requests.get(url)
    data = response.json()
    
    agents = data['data']
    
    output_dir = r"c:\Users\Tad\nutritrack\frontend\public\agents"
    os.makedirs(output_dir, exist_ok=True)
    
    for agent in agents:
        agent_name = agent['displayName'].lower()
        if agent_name == "kay/o":
            agent_name = "kayo"
            
        icon_url = agent.get('displayIcon')
        if not icon_url:
            continue
            
        file_name = f"{agent_name}.png"
        file_path = os.path.join(output_dir, file_name)
        
        print(f"Downloading {file_name}...")
        img_data = requests.get(icon_url).content
        with open(file_path, 'wb') as handler:
            handler.write(img_data)

if __name__ == "__main__":
    download_agents()
