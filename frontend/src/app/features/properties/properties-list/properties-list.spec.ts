import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesList } from './properties-list';

describe('PropertiesList', () => {
  let component: PropertiesList;
  let fixture: ComponentFixture<PropertiesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertiesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertiesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
