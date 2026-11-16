import { Component, OnInit, Input } from '@angular/core';
import { MANUAL_DATA } from '../fetching.service';

function formatNumber(value: number) {
  return value.toLocaleString('en-US');
}

@Component({
  selector: 'middle-nav-bar-page',
  templateUrl: './middle-nav-bar-page.component.html',
  styleUrls: ['./middle-nav-bar-page.component.less']
})
export class MiddleNavBarPageComponent {

  @Input() fetchedData: any;
  @Input() giraon: any;

  public taxPercentagesLayout = {
    xaxis: {
      autorange: true,
      title: { text: 'כמות' },
      type: "category",
      seperatethousands: false
    },
    yaxis: {
      autorange: true,
      title: { text: 'אחוז המס' },
      type: "linear",
      seperatethousands: false
    }
  }

  public brackets = MANUAL_DATA.incomeTaxBrackets;
  // The income from which the top rate applies, and the top rate itself
  public topBracketStart = this.brackets.brackets[this.brackets.brackets.length - 2].upTo;
  public topRate = this.brackets.brackets[this.brackets.brackets.length - 1].rate;

  public taxPercentagesData = [
    {
      mode: 'lines+markers',
      name: 'מסים ישירים',
      ...MiddleNavBarPageComponent.bracketsChart(this.brackets.brackets),
    },
    {
      mode: 'lines+markers',
      name: 'מסים עקיפים',
      x: [],
      y: [],
    }
  ];

  // Builds a step chart: each bracket appears twice - once with the previous rate and once with its own
  static bracketsChart(brackets: Array<{upTo: number, rate: number}>) {
    const x = [];
    const y = [];
    let from = null;
    for (const bracket of brackets) {
      let label;
      if (from === null) {
        label = `עד ${formatNumber(bracket.upTo)}`;
      } else if (bracket.upTo === null) {
        label = `${formatNumber(from)} ומעלה`;
      } else {
        label = `מ${formatNumber(from)} עד ${formatNumber(bracket.upTo)}`;
      }
      if (from !== null) {
        x.push(label);
        y.push(y[y.length - 1]);
      }
      x.push(label);
      y.push(bracket.rate);
      from = bracket.upTo;
    }
    return { x, y };
  }

  formatNumber(value: number) {
    return formatNumber(value);
  }
}
