import requests
import bs4
from bs4 import BeautifulSoup
from datetime import date
from collections import defaultdict

def scheduleScraper(event, context):
    def teamScraper(event, context):
        baseball_ref_url = "https://www.baseball-reference.com/teams/"
        mlb_url = "https://www.mlb.com"

        team_name_url = BeautifulSoup(requests.get(baseball_ref_url).content, "html.parser")
        teams = {
            name.next_element.string: {
                "teamName": name.next_element.string,
                "Abbreviation": name.next_element.get('href').split('/')[2],
                "Baseball ref url": baseball_ref_url + f"{name.next_element.get('href').split('/')[2]}/2023-schedule-scores.shtml",
                "Website": mlb_url + f"/{name.next_element.string.split(' ')[-1]}"
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
                "Website": "https://www.mlb.com/redsox"
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
                "Website": "https://www.mlb.com/whitesox"
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
                "baseballReference": "https://www.baseball-reference.com/teams/LAA/2023-schedule-scores.shtml"
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
                "baseballReference": "https://www.baseball-reference.com/teams/MIA/2023-schedule-scores.shtml"
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
                "baseballReference": "https://www.baseball-reference.com/teams/TBR/2023-schedule-scores.shtml"
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
                "Website": "https://www.mlb.com/bluejays"
            }
        )
        teams["Washington Nationals"].update(
            {
                "Main Color": "#041e42", 
                "Secondary Color":"#ba0c2f", 
                "Abbreviation": "WSH"
            }
        )

        # team_df = defaultdict(dict)
        # allTeams = []
        for teamName, teamInfo in teams.items():
            teams[teamName].update({"baseballReference": baseball_ref_url + teamInfo["Abbreviation"] + "/2023-schedule-scores.shtml"})
            print(teamInfo["baseballReference"])
            # ----- get each team's baseball reference page -----+
            #----- "Schedule & Results" tab on that page -----+
            teamWebpage = BeautifulSoup(
                requests.get(teamInfo["baseballReference"]).content, 
                "html.parser"
            )
            
            #----- Parse table with results from all games that season and gather desired info -----+
            #----- based on html tags -----+
            winLoss, runsEarned, runsAllowed, opponents = map(
                lambda value: teamWebpage.find_all(
                    name="td",
                    attrs={
                        "data-stat": value}), 
                        ["win_loss_result", "R", "RA", "opp_ID"]
            )
            gameResults = {
                "W/L": [
                    game.text[0] for game in winLoss],
                "runs earned": [
                    runs.text for runs in runsEarned[0:len(winLoss)]],
                "runs allowed": [
                    runs.text for runs in runsAllowed[0:len(winLoss)]],
                "opponent": [
                    opponent.text for opponent in opponents[0:len(winLoss)]]
            }
            teams[teamName].update({"gameResults": gameResults})
            # print(teamInfo["Baseball ref url"])
            # #----- get each team's baseball reference page -----+
            # #----- "Schedule & Results" tab on that page -----+
            # teamWebpage = BeautifulSoup(
            #     requests.get(teamInfo["Baseball ref url"]).content, 
            #     "html.parser"
            # )
            
            # #----- Parse table with results from all games that season and gather desired info -----+
            # #----- based on html tags -----+
            # winLoss, runsEarned, runsAllowed, opponents = map(
            #     lambda value: teamWebpage.find_all(
            #         name="td",
            #         attrs={
            #             "data-stat": value}), 
            #             ["win_loss_result", "R", "RA", "opp_ID"]
            # )

            # df["W/L"] = [
            #     game.text[0] for game in winLoss
            # ]
            # df["runs earned"] = [
            #     runs.text for runs in runsEarned[0:len(winLoss)]
            # ]
            # df["runs allowed"] = [
            #     runs.text for runs in runsAllowed[0:len(winLoss)]
            # ]
            # df["Opp"] = [
            #     opponent.text for opponent in opponents[0:len(winLoss)]
            # ]
            # df["W/L tracker"] = df["W/L"].apply(
            #     lambda x: 1 if x == "W" else -1).cumsum()
        
            # wins = df[df['W/L'] == 'W']['W/L'].count()
            # losses = df[df['W/L'] == 'L']['W/L'].count()
            # winPercent = wins/(wins+losses)
        
            # team_df[team]= {
            #     "name": team,
            #     "data": df,
            #     "win percentage": winPercent
            # }
        
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
    
   
    
    teams = teamScraper(None, None)
    print(teams)
    schedule_url = "https://www.mlb.com/schedule/"
    schedule_webpage = BeautifulSoup(requests.get(schedule_url).content, "html.parser")
    sched = schedule_webpage.find_all(
        name="div",
        attrs={
            "data-mlb-test":"gameCardTitles"
            }
        )
    date_idx = [
        game_date.text 
        for game_date in sched 
        if str(date.today().day) in game_date.text][0]

    games = schedule_webpage.find_all(
        name="div",
        attrs={
            "data-mlb-test":"individualGameContainerDesktop"
            }
        )

    awayData = []
    homeData = []
    for game in games:
        if date_idx in game.parent.previous_sibling.text:
            awayTeamAbbrev = [j.text[:len(j.text)//2] 
            for i in game.descendants if isinstance(i, bs4.element.Tag)
            for j in i.find_all(
                "div", 
                attrs={
                    "class": "TeamMatchupLayerstyle__AwayWrapper-sc-ouprud-1 dmSctg"
                    }
                )
            ]
            homeTeamAbbrev = [j.text[:len(j.text)//2] 
            for i in game.descendants if isinstance(i, bs4.element.Tag)
            for j in i.find_all(
                "div", 
                attrs={
                    "class": "TeamMatchupLayerstyle__HomeWrapper-sc-ouprud-2 hHOoUi"
                    }
                )
            ]
            awayData.append(next(
                (
                    info
                    for key, info in teams.items() if awayTeamAbbrev[0] == info["Abbreviation"]
                ), 
                None
            ))
            homeData.append(next(
                (
                    info
                    for key, info in teams.items() if homeTeamAbbrev[0] == info["Abbreviation"]
                ), 
                None
            ))
    # print(awayData)
    return awayData, homeData

# scheduleScraper(None, None)


# mlbStandings = "https://www.mlb.com/standings"
# allTeamsWebpage = BeautifulSoup(requests.get(mlbStandings).content, "html.parser")
# # print(allTeamsWebpage)
# print(*[name for name in allTeamsWebpage.find_all(name="span", class_="team__grid")])


allTeamsWebpage = BeautifulSoup(requests.get("https://www.mlb.com/schedule/team-by-team").content, "html.parser")
print(*[name.text for name in allTeamsWebpage.find_all(name="h2", attrs={"class":"p-heading__text p-heading__text--lined p-heading__text--center p-heading__text--h5 styles-sc-zrz8sa-0 bFNgUm"})])

# baseball_ref_url = "https://www.baseball-reference.com/teams/"
# mlb_url = "https://www.mlb.com"

# <a href="/rays" data-team-name="Tampa Bay Rays" class="team p-text-link--mlb">TB</a>
# teams = {
#     name.next_element.string: {
#         "teamName": name.next_element.string,
#         "Abbreviation": name.next_element.get('href').split('/')[2],
#         "Baseball ref url": baseball_ref_url + f"{name.next_element.get('href').split('/')[2]}/2023-schedule-scores.shtml",
#         "Website": mlb_url + f"/{name.next_element.string.split(' ')[-1]}"
#     } for name in team_name_url.find_all(name="td", attrs={"data-stat":"franchise_name"})
# }


# baseball_ref_url = "https://www.baseball-reference.com/teams/"
# mlb_url = "https://www.mlb.com"

# team_name_url = BeautifulSoup(requests.get(baseball_ref_url).content, "html.parser")
# teams = {
#     name.next_element.string: {
#         "teamName": name.next_element.string,
#         "Abbreviation": name.next_element.get('href').split('/')[2],
#         "Baseball ref url": baseball_ref_url + f"{name.next_element.get('href').split('/')[2]}/2023-schedule-scores.shtml",
#         "Website": mlb_url + f"/{name.next_element.string.split(' ')[-1]}"
#     } for name in team_name_url.find_all(name="td", attrs={"data-stat":"franchise_name"})
# }
# print(teams)



# team_df = defaultdict(dict)
# allTeams = {}
# teamNames = ["braves", "whitesox"]
# winLoss = ['W', 'L', 'L', 'L', 'W']
# runsEarned = ['0', '1', '12', '12', '3']
# runsAllowed= ['0', '11', '21', '19', '4']
# #----- Parse table with results from all games that season and gather desired info -----+
# #----- based on html tags -----+
# data = {
#     "W/L": [
#         game for game in winLoss],
#     "runs earned": [
#         runs for runs in runsEarned[0:len(winLoss)]],
#     "runs allowed": [
#         runs for runs in runsEarned[0:len(winLoss)]]
# }
# team_df = {
#     teamName: data for teamName in teamNames}


# # team_df["W/L tracker"] = df["W/L"].apply(
# #     lambda x: 1 if x == "W" else -1).cumsum()

# # wins = df[df['W/L'] == 'W']['W/L'].count()
# # losses = df[df['W/L'] == 'L']['W/L'].count()
# # winPercent = wins/(wins+losses)

# # team_df[team]= {
# #     "name": team,
# #     "data": df,
# #     "win percentage": winPercent
# # }

# print(team_df)