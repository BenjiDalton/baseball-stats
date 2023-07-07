import requests
from bs4 import BeautifulSoup
import os

def teamScraper(event, context):
    baseball_ref_url = "https://www.baseball-reference.com/teams/"
    mlb_url = "https://www.mlb.com"

    team_name_url = BeautifulSoup(requests.get(baseball_ref_url).content, "html.parser")
    teams = {
        name.next_element.string: {
            "Team Name": name.next_element.string,
            "Abbreviation": name.next_element.get('href').split('/')[2],
            "Baseball ref url": baseball_ref_url + f"{name.next_element.get('href').split('/')[2]}/2023-schedule-scores.shtml",
            "MLB url": mlb_url + f"/{name.next_element.string.split(' ')[-1]}"
        } for name in team_name_url.find_all(name="td", attrs={"data-stat":"franchise_name"})
    }

    teams["Arizona Diamondbacks"].update(
        {
            "Main Color": "#a71930", 
            "Secondary Color": "#000000", 
            "Abbreviation": "AZ"
        }
    )
    teams["Atlanta Braves"].update(
        {
            "Main Color": "#ba0c2f", 
            "Secondary Color": 
            "#0c2340"
        }
    )
    teams["Baltimore Orioles"].update(
        {
            "Main Color": "#df4601", 
            "Secondary Color": "#000000"
        }
    )
    teams["Boston Red Sox"].update(
        {
            "Main Color": "#bd3039",
            "Secondary Color": "#0d2b56", 
            "MLB url": "https://www.mlb.com/redsox"
        }
    )
    teams["Chicago Cubs"].update(
        {
            "Main Color": "#0e3386", 
            "Secondary Color": "#cc3433"
        }
    )
    teams["Chicago White Sox"].update(
        {
            "Main Color": "#000000", 
            "Secondary Color":"#000000", 
            "Abbreviation": "CWS" , 
            "MLB url": "https://www.mlb.com/whitesox"
        }
    )
    teams["Cincinnati Reds"].update(
        {
            "Main Color": "#c6011f", 
            "Secondary Color":"#000000"
        }
    )
    teams["Cleveland Guardians"].update(
        {
            "Main Color": "#c7080f", 
            "Secondary Color":"#0a243d"
        }
    )
    teams["Colorado Rockies"].update(
        {
            "Main Color": "#33006f", 
            "Secondary Color":"#000000"
        }
    )
    teams["Detroit Tigers"].update(
        {
            "Main Color": "#0a2140", 
            "Secondary Color":"#001c42"
        }
    )
    teams["Houston Astros"].update(
        {
            "Main Color": "#002d62", 
            "Secondary Color":"#eb6e1f"
        }
    )
    teams["Kansas City Royals"].update(
        {
            "Main Color": "#004687", 
            "Secondary Color":"#004687", 
            "Abbreviation": "KC"
        }
    )
    teams["Los Angeles Angels"].update(
        {
            "Main Color": "#ba0021", 
            "Secondary Color":"#862633", 
            "Abbreviation": "LAA", 
            "Baseball ref url": 
            "https://www.baseball-reference.com/teams/LAA/2023-schedule-scores.shtml"
        }
    )
    teams["Los Angeles Dodgers"].update(
        {
            "Main Color": "#004680", 
            "Secondary Color":"#ffffff"
        }
    )
    teams["Miami Marlins"].update(
        {
            "Main Color": "#00a3e0", 
            "Secondary Color":"#eeeeee", 
            "Abbreviation": "MIA", 
            "Baseball ref url": "https://www.baseball-reference.com/teams/MIA/2023-schedule-scores.shtml"
        }
    )
    teams["Milwaukee Brewers"].update(
        {
            "Main Color": "#ffc72c", 
            "Secondary Color":"#13294b"
        }
    )
    teams["Minnesota Twins"].update(
        {
            "Main Color": "#031f40", 
            "Secondary Color":"#e20e32"
        }
    )
    teams["New York Mets"].update(
        {
            "Main Color": "#ff5910", 
            "Secondary Color":"#002d72"
        }
    )
    teams["New York Yankees"].update(
        {
            "Main Color": "#132448", 
            "Secondary Color":"#002a5c"
        }
    )
    teams["Oakland Athletics"].update(
        {
            "Main Color": "#006141", 
            "Secondary Color":"#ffb819"
        }
    )
    teams["Philadelphia Phillies"].update(
        {
            "Main Color": "#c20c31", 
            "Secondary Color":"#020731"
        }
    )
    teams["Pittsburgh Pirates"].update(
        {
            "Main Color": "#ffc72c", 
            "Secondary Color":"#000000"
        }
    )
    teams["San Diego Padres"].update(
        {
            "Main Color": "#2f241d", 
            "Secondary Color":"#ffc425", 
            "Abbreviation": "SD"
        }
    )
    teams["San Francisco Giants"].update(
        {
            "Main Color": "#ff4813",
            "Secondary Color":"#333333", 
            "Abbreviation": "SF"
        }
    )
    teams["Seattle Mariners"].update(
        {
            "Main Color": "#0c2c56", 
            "Secondary Color":"#005c5c"
        }
    )
    teams["St. Louis Cardinals"].update(
        {
            "Main Color": "#be0a14", 
            "Secondary Color":"#001541"
        }
    )
    teams["Tampa Bay Rays"].update(
        {
            "Main Color": "#092c5c", 
            "Secondary Color":"#8fbce6", 
            "Abbreviation": "TB", 
            "Baseball ref url": "https://www.baseball-reference.com/teams/TBR/2023-schedule-scores.shtml"
        }
    )
    teams["Texas Rangers"].update(
        {
            "Main Color": "#c0111f", 
            "Secondary Color":"#003278"
        }
    )
    teams["Toronto Blue Jays"].update(
        {
            "Main Color": "#134a8e", 
            "Secondary Color":"#1d2d5c", 
            "MLB url": "https://www.mlb.com/bluejays"
        }
    )
    teams["Washington Nationals"].update(
        {
            "Main Color": "#041e42", 
            "Secondary Color":"#ba0c2f", 
            "Abbreviation": "WSH"
        }
    )

    # for team, info in teams.items():
    #     info.update(
    #         {'Logo': next(
    #             (
    #                 os.path.join(root, file) for root, subdir, files in os.walk("team_logos") 
    #                 for file in files if team.split()[-1].lower() in file.lower()
    #             ),
    #             None)
    #         }
    #     )
    return teams
