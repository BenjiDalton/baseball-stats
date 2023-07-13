import { Component } from '@angular/core';

@Component({
	selector: 'app-apigateway-handler',
	templateUrl: './apigateway-handler.component.html',
	styleUrls: ['./apigateway-handler.component.scss']
})
export class APIGatewayHandlerComponent {
	scraper2022='https://nw00meomfg.execute-api.us-east-2.amazonaws.com/dev/2022-scraper'
	scraper2021='https://nw00meomfg.execute-api.us-east-2.amazonaws.com/dev/2021-scraper'
}
