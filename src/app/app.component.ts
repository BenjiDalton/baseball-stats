import { Component, OnInit, OnDestroy,  NgZone, ChangeDetectorRef} from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})

/* Goals 
2. Hovering over bar charts indicates each teams respective rank for that stat
3. Add pitching stats
4. If no teams are active then all charts disappear (preserve stats chosen)
*/

export class AppComponent implements OnInit, OnDestroy{
	constructor(private httpclient: HttpClient, private ngZone: NgZone, private cdr: ChangeDetectorRef) {
	}
	title='baseball_scraper_app';
	
	displayStatOptions=false;
	displaySlider=false;
	displayTable=false;
	displayChartLabels: any={
		"pitchingStats": false,
		"battingStats": false
	}
	pageLoaded=false;
	
	activeButtons: any={
		"Divisions": {} as { [key: string]: boolean },
		"Teams": {} as { [key: string]: boolean },
		"pitchingStats": {} as { [key: string]: boolean },
		"battingStats": {} as { [key: string]: boolean },
		"2021": {
			"Teams": {}
		},
		"2022": {
			"Teams": {}
		}
	};
	entireMLB={
		"AmericanLeague": {
			"East": [
				"Baltimore Orioles",
				"Boston Red Sox",
				"New York Yankees",
				"Tampa Bay Rays",
				"Toronto Blue Jays"
			],
			"Central": [
				"Chicago White Sox",
				"Cleveland Guardians",
				"Detroit Tigers",
				"Kansas City Royals",
				"Minnesota Twins"
			],
			"West": [
				"Houston Astros",
				"Los Angeles Angels",
				"Oakland Athletics",
				"Seattle Mariners",
				"Texas Rangers"
			]
		},
		"NationalLeague": {
			"East": [
				"Atlanta Braves",
				"Miami Marlins",
				"New York Mets",
				"Philadelphia Phillies",
				"Washington Nationals"
			],
			"Central": [
				"Chicago Cubs",
				"Cincinnati Reds",
				"Milwaukee Brewers",
				"Pittsburgh Pirates",
				"St. Louis Cardinals"
			],
			"West": [
				"Arizona Diamondbacks",
				"Colorado Rockies",
				"Los Angeles Dodgers",
				"San Diego Padres",
				"San Francisco Giants"
			]
		}
	};
	yearsData: {[year: string]: any;}={
			"2021": {
				"Teams": {},
				"battingStats": {},
				"pitchingStats": {}
			},
			"2022": {
				"Teams": {},
				"battingStats": {},
				"pitchingStats": {}
			}
		};
	
	chart: any;
	chartData: any = {
		"labels": {},
		"datasets": []
	};
	activeYear: any;
	currentYearData: any;
	teamNames: any;
	activeTeams: {[year: string]: any;}={
		"2021": [],
		"2022": []
	}
	activeStats: any = {
		"2021": {
			"pitchingStats": {},
			"battingStats": {}
		},
		"2022": {
			"pitchingStats": {},
			"battingStats": {}
		}
	};
	battingStats: any[]=[];
	pitchingStats: any[]=[];
	maxSliderValue: any;
	pointRadius=4;

	ngOnInit(): void {
		this.fetch2021Schedule().subscribe(([teamData, statNames]) => {
			this.yearsData["2021"]["Teams"]=teamData;
			this.yearsData["2021"]["battingStats"]=statNames.battingStats;
			this.yearsData["2021"]["pitchingStats"]=statNames.pitchingStats;
		});
		this.fetch2022Schedule().subscribe(([teamData, statNames]) => {
			this.yearsData["2022"]["Teams"]=teamData;
			this.yearsData["2022"]["battingStats"]=statNames.battingStats;
			this.yearsData["2022"]["pitchingStats"]=statNames.pitchingStats;
			this.teamNames=Object.keys(teamData);
			this.pageLoaded=true;
			this.activeYear="2022";
			this.currentYearData=this.yearsData[this.activeYear];
		});
	}
	ngOnDestroy(): void {
		this.destroyChart()
	}
	fetch2022Schedule(): Observable<any[]> {
		return new Observable<any[]>((observer) => {
		this.httpclient.get<any[]>('https://nw00meomfg.execute-api.us-east-2.amazonaws.com/dev/2022-scraper').subscribe(result => {
			const [teamData, statNames]=result;
			observer.next([teamData, statNames]);
			observer.complete();
		})})
	}
	fetch2021Schedule(): Observable<any[]> {
		return new Observable<any[]>((observer) => {
		this.httpclient.get<any[]>('https://nw00meomfg.execute-api.us-east-2.amazonaws.com/dev/2021-scraper').subscribe(result => {
			const [teamData, statNames]=result;
			observer.next([teamData, statNames]);
			observer.complete();
		})})
	}
	getCheckboxStatus(): void {
		const checkbox=document.getElementById("myCheckbox");
		if (checkbox instanceof HTMLInputElement) {
			if (checkbox.checked) {
				this.activeYear="2022";
			} else {
				this.activeYear="2021";
			}
			this.currentYearData=this.yearsData[this.activeYear];
		}
		this.generateBarCharts()
	}
	toggleButton(eventTarget: EventTarget | null, subclass: "Divisions"| "Teams" | "pitchingStats"| "battingStats"): void {
		if (eventTarget instanceof HTMLElement) {
			if (subclass==="Teams") {
				const buttonId=eventTarget.id;
				this.activeButtons[this.activeYear][subclass][buttonId]=!this.activeButtons[this.activeYear][subclass]?.[buttonId];
				this.handleTeams();
			} else if (subclass==="pitchingStats" || subclass==="battingStats") {
				if (eventTarget.parentElement){
					const buttonId=eventTarget.id;
					this.activeButtons[subclass][buttonId]=!this.activeButtons[subclass]?.[buttonId];
					this.handleStats(subclass);
				}
			}
			if (subclass==="Divisions") {
				if (eventTarget.parentElement){
					const divisionId=eventTarget.parentElement.id
					this.activeButtons[subclass][divisionId]=!this.activeButtons[subclass]?.[divisionId];
					this.handleDivision(divisionId);
				}
			}
		}
	this.generateBarCharts();
	}	
	updateSliderValue(): void {
		const maxSlider=document.getElementById("maxSlider") as HTMLInputElement;
		this.maxSliderValue=maxSlider.value;
		this.fillChartData();
	}	
	switchStatus(event: Event): void {
		console.log("lol doesn't do anything anymore but maybe will one day idk");
	}
	handleTeams(): void {
		const buttonContainer=document.querySelector(".teams-dropdown-content");
		const buttons=buttonContainer?.querySelectorAll("button");
		if (!this.activeTeams[this.activeYear]) {
			this.activeTeams[this.activeYear]=[];
		}
		if (!this.activeButtons[this.activeYear]["Teams"]) {
			this.activeButtons[this.activeYear]["Teams"]=[];
		}
		buttons?.forEach((button) => {
			const team=this.currentYearData['Teams'][button.id];
			if (this.activeButtons[this.activeYear]["Teams"][button.id] && !this.activeTeams[this.activeYear].includes(team)) {
					this.activeTeams[this.activeYear].push(team);
					this.addLine();
			} else if (!this.activeButtons[this.activeYear]["Teams"][button.id] && this.activeTeams[this.activeYear].includes(team)) {
					const index=this.activeTeams[this.activeYear].indexOf(team);
					if (index !== -1) {
						this.activeTeams[this.activeYear].splice(index, 1);
						this.fillChartData();
				}
			}
		});
		this.generateBarCharts()
	}
	handleStats(statCategory: "pitchingStats"| "battingStats"): void {
		const buttonContainer=document.querySelector(`.stats-dropdown-content#${statCategory}`);
		const buttons=buttonContainer?.querySelectorAll("button");
		
		buttons?.forEach((button) => {
			if (this.activeButtons[statCategory][button.id]) {
				if (!this.activeStats[this.activeYear][statCategory][button.id]) {
					this.activeStats[this.activeYear][statCategory][button.id]=!this.activeStats[this.activeYear][statCategory][button.id];
					this.detectChanges();
				}
			} else {
				delete this.activeStats[this.activeYear][statCategory][button.id];
				}
			});
		this.generateBarCharts();
	}
	handleDivision(divisionId: string): void {
		const buttonContainer=document.querySelector(`.teams-dropdown-subheader#${divisionId}`);
		const buttons=buttonContainer?.querySelectorAll("button");
		if (this.activeButtons["Divisions"][divisionId]) {
			buttons?.forEach((button) => {
				if (button.id){
					this.activeButtons['Teams'][button.id]=true;
					this.handleTeams();
				}
			});
		} else {
			buttons?.forEach((button) => {
				if (button.id){
					this.activeButtons['Teams'][button.id]=false;
					this.handleTeams();
				}
			});
			this.activeButtons["Divisions"][divisionId]=false;
		}
	}
	fillChartData(): void {
		this.destroyChart();
		this.chartData={"labels": {}, "datasets": []};
		const increment=1;
		let maxGames: any;
		let pointStyle: any;
		if (!this.maxSliderValue) {
			maxGames = 162;
		  } else {
			maxGames = this.maxSliderValue;
		  }
		const labels = Array.from({ length: Math.ceil(maxGames / increment) }, (_, index) => (index * increment).toString());
		this.chartData["labels"]=labels
		for (let year in this.activeTeams) {
			if (year==="2021") {
				pointStyle="circle";
			} else if (year==="2022") {
				pointStyle="triangle";
			}
			const yearData=this.activeTeams[year].map((team: any, index: any) => ({
				label: team.name + ` (${year})`,
				data: team.netRecord,
				backgroundColor: team.mainColor,
				borderColor: team.secondaryColor,
				borderWidth: 2,
				pointRadius: this.pointRadius,
				pointStyle: pointStyle
			}));
			this.chartData["datasets"].push(...yearData);
		}
		this.generateChart();
	}
	addLine(): void {
		if (this.chartData["datasets"].length>0) {
			const newTeamIndex=this.activeTeams[this.activeYear].length - 1;
			let pointStyle: any;
			if (this.activeYear==="2021") {
				pointStyle="circle";
			} else if (this.activeYear==="2022") {
				pointStyle="triangle";
			}
			const newDataset={
				label: this.activeTeams[this.activeYear][newTeamIndex].name  + ` (${this.activeYear})`,
				data: this.activeTeams[this.activeYear][newTeamIndex].netRecord,
				backgroundColor: this.activeTeams[this.activeYear][newTeamIndex].mainColor,
				borderColor: this.activeTeams[this.activeYear][newTeamIndex].secondaryColor,
				borderWidth: 2,
				pointRadius: this.pointRadius,
				pointStyle: pointStyle
			};
			this.chartData["datasets"].push(newDataset);
			this.chart.data=this.chartData;
			this.chart.update();
		} else {
			this.displayStatOptions=true;
			this.displaySlider=true;
			const increment=1;
			let maxGames: any;
			let pointStyle: any;
			if (!this.maxSliderValue) {
				maxGames = 162;
			} else {
				maxGames = this.maxSliderValue;
			}
			const labels = Array.from({ length: Math.ceil(maxGames / increment) }, (_, index) => (index * increment).toString());
			this.chartData["labels"]=labels
				
			this.chartData["datasets"]=this.activeTeams[this.activeYear].map((team: any, index: any) => ({
				label: team.name + ` (${this.activeYear})`,
				data: team.netRecord,
				backgroundColor: team.mainColor,
				borderColor: team.secondaryColor,
				borderWidth: 2,
				pointRadius: this.pointRadius,
				pointStyle: pointStyle
			}));
			this.generateChart()
		}
	}
	removeLine(): void {
		this.chartData.datasets=this.chartData["datasets"].filter((dataset: any) => {
			if (!this.activeTeams[this.activeYear].some((team: any) => team.name+ ` (${this.activeYear})`===dataset.label)) {
				return false;
			}
			return true; 
		});
		this.chart.update();
	}
	generateBarCharts(): void {
		const stats: any[]=[];
		for (let statCategory of ["pitchingStats", "battingStats"]) {
			Object.keys(this.activeButtons[statCategory]).forEach((stat) => {
				this.displayChartLabels[statCategory]=true;
				stats.push([statCategory, stat])
			});
		}
		stats.forEach((value, index) => {
			const yearData: any[]=[];
			const chartDataMap: any={"labels": [], "datasets": []};
			let statCategory=stats[index][0]
			let stat=stats[index][1]
			const canvas: any=document.getElementById(statCategory + "-" + stat + "-Chart");
			const existingChart=Chart.getChart(canvas)
			chartDataMap["labels"]=["Teams"]
			for (let year in this.activeTeams) {
				const teamData=this.activeTeams[year].map((team: any, index: any) => ({
					label: team.name + ` (${year})`,
					data: [team[statCategory][stat]],
					backgroundColor: team.mainColor,
					borderColor: team.secondaryColor,
					borderWidth: 2
				}));
				chartDataMap["datasets"].push(...teamData);
			}
			yearData.push(chartDataMap)
			const chartData = {
				labels: yearData[0].labels,
				datasets: yearData.flatMap((chartDataMap: any) => chartDataMap.datasets)
			};
			
			if (existingChart && JSON.stringify(existingChart.data)===JSON.stringify(chartData)) {
				return
			} else if (existingChart && JSON.stringify(existingChart.data)!==JSON.stringify(chartData)) {
				existingChart.data=chartData
				existingChart.update()
			}
			else {
				new Chart(canvas, {
					type: 'bar',
					data: chartData,
					options: {
					scales: {
						y: {
							beginAtZero: true,
							grid: {
								display: false,
							},
						},
						x: {
							display: false,
							beginAtZero: true,
							grid: {
								display: false,
							},
						},
					},
					plugins: {
						legend: {
							display: false,
							position: 'top',
							},
						title: {
							display: true,
							text: stat,
							position: 'left',
						},
						datalabels: {
							anchor: 'center',
							align: 'center',
							font: {
								size: 14,
								weight: 'bold',
								},
							color: 'white',
							formatter: function (value: any, context: any) {
								const datasetIndex = context.datasetIndex;
								// const teamName = chartData.datasets[datasetIndex].label;
								// const shortenedName: string = teamName.split(' ').pop();
								let formattedValue: string;
								if (Number.isInteger(value)) {
									formattedValue = value.toString();
								} else {
									formattedValue = value.toFixed(2);
									if (formattedValue.endsWith('0')) {
									formattedValue = value.toFixed(0);
									}
								}
							},
							textAlign: 'center'
						},
					},
					},
					plugins: [ChartDataLabels],
				});
			}
		});
	}
	private generateChart(): void {
		const canvas: any=document.getElementById("myChart");
		this.chart=new Chart(canvas, {
			type: 'line',
			data: this.chartData,
			options: {
				scales: {
					y: {
						beginAtZero: true,
						grid: {
							display: false
						}
					},
					x: {
						beginAtZero: true,
						grid: {
							display: false
						}
					}
				},
				interaction: {
					intersect: true,
					mode: 'index'
				},
				plugins: {
					tooltip: {
						callbacks: {
							label: function(context) {
								this.title=["Game"+ `${context.dataIndex + 1}`];
								let label=context.dataset.label || '';
								let wins=0;
								let losses=0;
								if (label) {
									label += ': ';
								}
								if (context.parsed.y !== null) {
									const dataIndex=context.dataIndex;
									const winLoss: any=context.dataset.data;
									for (let i=0; i<=dataIndex; i++) {
										const value: any=winLoss[i];
										if (value > winLoss[i-1]) {
											wins+=1;
										} else {
											losses+=1;
										}
									}
									label+=`${wins}-${losses}`;
								}
								return label;
							}
						}
					},
					legend: {
						position: 'top',
						labels: {
							font: {
								size: 14,
								weight: 'bold'
							},
							usePointStyle: true
						}
					}
				},
			}
		});
	}
	private detectChanges(): void {
		this.ngZone.run(() => {
			this.cdr.detectChanges();
		});
	}
	private destroyChart(): void {
		if (this.chart) {
		  this.chart.destroy();
		}
	}
}