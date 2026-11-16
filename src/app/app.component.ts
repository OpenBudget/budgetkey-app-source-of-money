import { Component, Inject, OnInit, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DEFICIT_FUNDING, FetchingService } from './fetching.service';

const _TRANSLATIONS = window['TRANSLATIONS'] || {};

export function __T(content) {
  const ret = _TRANSLATIONS[content];
  if (!ret) {
    return content;
  }
  return ret;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  public headline: string = 'מקור הכסף';
  public funcCategories: any[];
  public econCategories: any[];
  public incomeCategories: any[];
  public totalAmount = 0;
  public year: number = 0;
  public __ = __T;
  public adVisible = false;


  public giraonSum = 0;
  public data: any;
  public giraon: any;

  constructor(public translate: TranslateService, private fetching: FetchingService) {
    this.newGetData();
    translate.addLangs(['he', 'ar']);
    translate.setDefaultLang('he');
    const urlParams = new URLSearchParams(window.location.search);
    const queryLang = urlParams.get('lang');
    const browserLang = queryLang || translate.getBrowserLang();
    translate.use(browserLang.match(/he|ar/) ? browserLang : 'he');
  }

  async newGetData() {
    // income items of the latest budget year
    this.year = await this.fetching.getYear();
    var data = await this.fetching.getIncomeItems();
    this.data = data;

    //creates an ordered diconary from data
    var minimizedData = {};
    this.totalAmount = 0;
    for (var item of data) {
      if (!item.allocated) continue;

      if (!minimizedData[item.func_title])
        minimizedData[item.func_title] = { name: item.func_title, scale: 1, amount: 0, values: {} };

      minimizedData[item.func_title].amount += item.allocated;
      minimizedData[item.func_title].values[item.title] = { amount: item.allocated, href: `https://next.obudget.org/i/budget/${item.code}/${item.year}` };
      if (item.func_title != DEFICIT_FUNDING)
        this.totalAmount += item.allocated;
    }

    //turns diconary into array
    var minimizedArray = [];
    for (let item in minimizedData) {
      minimizedArray.push(minimizedData[item]);
    }

    //sets a max amount of subcategories
    for (let item of minimizedArray) {
      var arrOfSub = [];
      for (let sub in item.values) {
        arrOfSub.push({ ...item.values[sub], name: sub });
      }

      let maxAmount = 5;

      if (arrOfSub.length > maxAmount - 1) {
        var sortedSub = arrOfSub.sort((a, b) => b.amount - a.amount);

        var sortedSubData = {}
        for (let sub of sortedSub.slice(0, maxAmount - 1)) {
          var shortName = sub.name;
          if (shortName.length > 10)
            shortName = shortName.slice(0, 10) + "...";
          sortedSubData[sub.name] = { ...sub, shortName: shortName };
        }
        item.values = sortedSubData;

        var otherSum = sortedSub.slice(maxAmount - 1, sortedSub.length).reduce((sum, curr) => sum += curr.amount, 0);

        if (otherSum > 0)
          item.values['אחר'] = { amount: otherSum, name: 'אחר' };
      }
    }

    for (let i = 0; i < minimizedArray.length; i++) {
      if (minimizedArray[i].name == DEFICIT_FUNDING) {
        this.giraon = minimizedArray[i];
        this.giraon.percent = (this.giraon.amount / (this.totalAmount + this.giraon.amount)) * 100;
        minimizedArray.splice(i, 1);
        console.log(this.giraon);
      }
    }

    //gets the percentage of each category
    for (let item of minimizedArray)
      item.percent = (item.amount / this.totalAmount) * 100;

    minimizedArray.sort((a, b) => b.amount - a.amount)
    this.funcCategories = minimizedArray;
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    this.adVisible = window.scrollY < 30;
  }

  ngOnInit() {
    this.adVisible = true;
  }

  onNavigate(url: string) {
    window.location.href = url;
  }

}
