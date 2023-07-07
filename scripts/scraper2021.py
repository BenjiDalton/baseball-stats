import requests
import bs4
from bs4 import BeautifulSoup
import re
def scraper2021(event, context):
    def updateTeams():

        teams["Arizona Diamondbacks"].update(
            {
                "mainColor": "#a71930", 
                "secondaryColor": "#000000", 
                "Abbreviation": "AZ"
            }
        )
        teams["Atlanta Braves"].update(
            {
                "mainColor": "#ba0c2f", 
                "secondaryColor": 
                "#0c2340"
            }
        )
        teams["Baltimore Orioles"].update(
            {
                "mainColor": "#df4601", 
                "secondaryColor": "#000000"
            }
        )
        teams["Boston Red Sox"].update(
            {
                "mainColor": "#bd3039",
                "secondaryColor": "#0d2b56", 
                "Website": "https://www.mlb.com/redsox"
            }
        )
        teams["Chicago Cubs"].update(
            {
                "mainColor": "#0e3386", 
                "secondaryColor": "#cc3433"
            }
        )
        teams["Chicago White Sox"].update(
            {
                "mainColor": "#000000", 
                "secondaryColor":"#000000", 
                "Abbreviation": "CWS" , 
                "Website": "https://www.mlb.com/whitesox"
            }
        )
        teams["Cincinnati Reds"].update(
            {
                "mainColor": "#c6011f", 
                "secondaryColor":"#000000"
            }
        )
        teams["Cleveland Guardians"].update(
            {
                "mainColor": "#c7080f", 
                "secondaryColor":"#0a243d"
            }
        )
        teams["Colorado Rockies"].update(
            {
                "mainColor": "#33006f", 
                "secondaryColor":"#000000"
            }
        )
        teams["Detroit Tigers"].update(
            {
                "mainColor": "#0a2140", 
                "secondaryColor":"#001c42"
            }
        )
        teams["Houston Astros"].update(
            {
                "mainColor": "#002d62", 
                "secondaryColor":"#eb6e1f"
            }
        )
        teams["Kansas City Royals"].update(
            {
                "mainColor": "#004687", 
                "secondaryColor":"#004687", 
                "Abbreviation": "KC"
            }
        )
        teams["Los Angeles Angels"].update(
            {
                "mainColor": "#ba0021", 
                "secondaryColor":"#862633", 
                "Abbreviation": "LAA", 
                "baseballReference": "https://www.baseball-reference.com/teams/LAA/2023-schedule-scores.shtml"
            }
        )
        teams["Los Angeles Dodgers"].update(
            {
                "mainColor": "#004680", 
                "secondaryColor":"#ffffff"
            }
        )
        teams["Miami Marlins"].update(
            {
                "mainColor": "#00a3e0", 
                "secondaryColor":"#eeeeee", 
                "Abbreviation": "MIA", 
                "baseballReference": "https://www.baseball-reference.com/teams/MIA/2023-schedule-scores.shtml"
            }
        )
        teams["Milwaukee Brewers"].update(
            {
                "mainColor": "#ffc72c", 
                "secondaryColor":"#13294b"
            }
        )
        teams["Minnesota Twins"].update(
            {
                "mainColor": "#031f40", 
                "secondaryColor":"#e20e32"
            }
        )
        teams["New York Mets"].update(
            {
                "mainColor": "#ff5910", 
                "secondaryColor":"#002d72"
            }
        )
        teams["New York Yankees"].update(
            {
                "mainColor": "#132448", 
                "secondaryColor":"#002a5c"
            }
        )
        teams["Oakland Athletics"].update(
            {
                "mainColor": "#006141", 
                "secondaryColor":"#ffb819"
            }
        )
        teams["Philadelphia Phillies"].update(
            {
                "mainColor": "#c20c31", 
                "secondaryColor":"#020731"
            }
        )
        teams["Pittsburgh Pirates"].update(
            {
                "mainColor": "#ffc72c", 
                "secondaryColor":"#000000"
            }
        )
        teams["San Diego Padres"].update(
            {
                "mainColor": "#2f241d", 
                "secondaryColor":"#ffc425", 
                "Abbreviation": "SD"
            }
        )
        teams["San Francisco Giants"].update(
            {
                "mainColor": "#ff4813",
                "secondaryColor":"#333333", 
                "Abbreviation": "SF"
            }
        )
        teams["Seattle Mariners"].update(
            {
                "mainColor": "#0c2c56", 
                "secondaryColor":"#005c5c"
            }
        )
        teams["St. Louis Cardinals"].update(
            {
                "mainColor": "#be0a14", 
                "secondaryColor":"#001541"
            }
        )
        teams["Tampa Bay Rays"].update(
            {
                "mainColor": "#092c5c", 
                "secondaryColor":"#8fbce6", 
                "Abbreviation": "TB", 
                "baseballReference": "https://www.baseball-reference.com/teams/TBR/2023-schedule-scores.shtml"
            }
        )
        teams["Texas Rangers"].update(
            {
                "mainColor": "#c0111f", 
                "secondaryColor":"#003278"
            }
        )
        teams["Toronto Blue Jays"].update(
            {
                "mainColor": "#134a8e", 
                "secondaryColor":"#1d2d5c", 
                "Website": "https://www.mlb.com/bluejays"
            }
        )
        teams["Washington Nationals"].update(
            {
                "mainColor": "#041e42", 
                "secondaryColor":"#ba0c2f", 
                "Abbreviation": "WSH"
            }
        )
        return teams
    
    def updateWinsLosses(team, isWin):
    
        if isWin==True:
            team["wins"].append(team["wins"][-1] + 1)
            team["losses"].append(team["losses"][-1])
        elif isWin==False:
            team["wins"].append(team["wins"][-1])
            team["losses"].append(team["losses"][-1] + 1)
        
        team["netRecord"].append(team["wins"][-1]-team["losses"][-1])

    teams={}
    schedule_url="https://www.baseball-reference.com/leagues/majors/2021-schedule.shtml"
    schedule_webpage=BeautifulSoup(requests.get(schedule_url).content, "html.parser")
    games=schedule_webpage.find_all(
        name="p",
        attrs={
            "class":"game"
            }
        )

    for game in games:
        awayTeamTags=game.find_all("a")
        awayTeamName=awayTeamTags[0].text.strip()
        awayTeamScore=float(re.search(r"\d+", awayTeamTags[0].next_sibling.strip()).group())

        homeTeamTags=game.find_all("a")
        homeTeamName=homeTeamTags[1].text.strip()
        homeTeamScore=float(re.search(r"\d+", homeTeamTags[1].next_sibling.strip()).group())
        awayTeamName="Arizona Diamondbacks" if awayTeamName == "Arizona D'Backs" else awayTeamName
        homeTeamName="Arizona Diamondbacks" if homeTeamName == "Arizona D'Backs" else homeTeamName
        awayTeamName="Cleveland Guardians" if awayTeamName == "Cleveland Indians" else awayTeamName
        homeTeamName="Cleveland Guardians" if homeTeamName == "Cleveland Indians" else homeTeamName

        for teamInfo in [[awayTeamName, awayTeamScore, homeTeamScore], [homeTeamName, homeTeamScore, awayTeamScore]]:
            teamName=teamInfo[0]
            teamScore=teamInfo[1]
            otherTeamScore=teamInfo[2]
            if teamName  in teams:
                teams[teamName]["runsEarned"].append(teamScore)
                teams[teamName]["runsAllowed"].append(otherTeamScore)
            else:
                teams[teamName]={
                    "name": teamName,
                    "runsEarned": [teamScore],
                    "runsAllowed": [otherTeamScore],
                    "wins": [0],
                    "losses": [0],
                    "netRecord": [0]
                }

        if awayTeamScore > homeTeamScore:
            updateWinsLosses(teams[awayTeamName], True)
            updateWinsLosses(teams[homeTeamName], False)
        elif homeTeamScore > awayTeamScore:
            updateWinsLosses(teams[awayTeamName], False)
            updateWinsLosses(teams[homeTeamName], True)

    pitchingStats="https://www.baseball-reference.com/leagues/majors/2021-standard-pitching.shtml"
    battingStats="https://www.baseball-reference.com/leagues/majors/2021-standard-batting.shtml"
    webpage=BeautifulSoup(requests.get(battingStats).content, "html.parser")
    dataTable=webpage.find("tbody")

    dataStats=webpage.find("thead")
    statNames=[]
    for column in dataStats.find_all("th"):
        if "Tm" in column:
            continue
        statNames.append(column.text.strip())

    for row in dataTable.find_all("tr"):
        teamName=row.find("th").text.strip()

        stats=[]  # Initialize the stats list here, outside the loop
        for cell, statName in zip(row.find_all("td")[0:], statNames):
            stat=cell.text.strip()
            stats.append(float(stat))

        if teamName in teams:
            teams[teamName]["stats"]=stats
        else:
            teams[teamName]={
                "name": teamName,
                "stats": stats
            }

    updateTeams()
    return teams, statNames