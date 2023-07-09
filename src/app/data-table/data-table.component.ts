import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { cloneDeep } from 'lodash'; 

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnChanges {
  @Input() yearsData: any;
  @Input() activeYear: any;
  @Input() entireMLB: any;
  @Input() currentYearData: any;
  selectedStatsCategory: any='pitchingStats';
  selectedLeague: any;
  selectedDivision: any;
  tableTeams: any[]=[]
  tableData: any;

  /* 
  currently this.yearData gets updated to only include those from a chosen division 
  we want it to preserve all teams
  */
  
	ngOnChanges(changes: SimpleChanges): void {
		if (changes['currentYearData']) {
			this.tableData=this.currentYearData
		}
		console.log("table data initialized", this.tableData)
	}
	getStatsForTeam(team: any): any {
		return Object.values(this.tableData['Teams'][team][this.selectedStatsCategory]);
	}
	getStatsCategory(eventTarget: any): void {
		console.log("year data in stats category: ", this.yearsData)
		this.selectedStatsCategory=eventTarget.value;
	}
	getLeague(eventTarget: any): void {
		this.selectedLeague = eventTarget.value;
		// console.log("currentYearData in getLeague()", this.currentYearData);
		
		if (this.entireMLB[this.selectedLeague]) {
			this.tableTeams=[]
			Object.keys(this.entireMLB[this.selectedLeague]).forEach((division: string) => {
				const teamsForDivision = this.entireMLB[this.selectedLeague][division].forEach((team: any) => {
					console.log(team)
					const teamData=this.currentYearData['Teams'][team];
					this.tableTeams.push(teamData);
			});
			// console.log("teams for division", teamsForDivision);
			// this.tableData['Teams'] = this.tableData['Teams'].concat(teamsForDivision);
			});
		}
		this.currentYearData=this.yearsData[this.activeYear];
		console.log("table teams", this.tableTeams)
		console.log(this.currentYearData)
		this.tableData['Teams']=this.tableTeams;
	// 	console.log("current year data after changing league", this.currentYearData);
	// 	console.log("table data after changing league", this.tableData);
	}
	getDivision(eventTarget: any): void {
		this.selectedDivision=eventTarget.value;
		// console.log("table data reset")
		// this.tableData['Teams']=[];
		// for (let team of this.yearsData[this.activeYear]['Teams']) {
		// 	if (team in this.entireMLB[this.selectedLeague][this.selectedDivision]) {
		// 		this.tableData['Teams'].push(team);
		// 	}
		// }
	}
}
