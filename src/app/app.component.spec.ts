import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { BudgetKeyCommonModule, LANG_TOKEN, THEME_ID_TOKEN } from 'budgetkey-ng2-components';
import { BrowserModule } from '@angular/platform-browser';
import { BudgetkeyNg2AuthModule } from 'budgetkey-ng2-auth';
import { MainPageSummaryComponent } from './main-page-summary/main-page-summary.component';
import { CategoryVisualizationComponent } from './category-visualization/category-visualization.component';
import { CategoryVisualizationInfoPopupComponent } from './category-visualization-info-popup/category-visualization-info-popup.component';
import { SingleValueTaxComponent } from './tax-game/single-value-tax/single-value-tax.component';


describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BudgetKeyCommonModule,
        BudgetkeyNg2AuthModule,
      ],
      declarations: [
        AppComponent,
        MainPageSummaryComponent,
        CategoryVisualizationComponent,
        CategoryVisualizationInfoPopupComponent,
      ],
      providers: [
        {provide: THEME_ID_TOKEN, useValue: 'budgetkey'},
        {provide: LANG_TOKEN, useValue: 'he'},
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

});
