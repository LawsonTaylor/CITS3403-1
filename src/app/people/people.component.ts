import { Component, OnInit, OnDestroy } from '@angular/core';
import { Person } from '../person';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const planetImages = ['bespin', 'coruscant', 'dagobah', 'endor', 'geonosis', 'hoth', 'kashyykk', 'naboo', 'tatooine'];
const colours = ['#1E88E5', '#7b1fa2', '#ffc107', '#0097a7', '#607d8b', '#c2185b', '#cddc39', '#388e3c',
 '#ff4081', '#689f38', '#e040fb', '#0288d1'];
const swapiUrl = 'https://swapi.co/api/';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css']
})
export class PeopleComponent implements OnInit, OnDestroy {

  people: Person[] = [];
  planets = {};
  coloursCounter = 0;

  constructor(private http: Http) {
  }

  // check if exists png image for persons homeworld
  // else deafults to B&W dead world image
  planetImageExists(name: string): boolean {
    planetImages.forEach(planet => {
      if (name.toLowerCase() === planet) {
        return true;
      }
    });
    return false;
  }

  // adds home world data to person from planets list by homeworld id
  // homeworld id corrisponds to api endpoint eg. api/planets/{id}/
  // if id not found in stored planets data call getPlanetData()
  addHomeworldToPerson(person: Person): void {
    const homeworld_id = person.homeworld.split('')[person.homeworld.length - 2];
    if (!(homeworld_id in this.planets)) {
      this.getPlanetData(person.homeworld);
    }
    person.homeworld = homeworld_id;
  }

  // Creates and adds person object to list of people
  // @params data = object returned from api/people response.results
  addPerson(data): void {
    let p: Person = {...data};
    const initals = data.name.split(' ').map(nm => nm[0]);
    p.initals = initals.join('');
    p = this.addInitialColourToPerson(p);
    // Adds home planet data to user
    this.addHomeworldToPerson(p);
    p.homeworld_url = (homeworld) => '../../assets/images/' + this.planets[homeworld].name.toLowerCase() + '.png';
    // Add to list of Charcters
    this.people.push(p);
  }

  // adds a random material design colour to person for Initals Box
  addInitialColourToPerson(person: Person): Person {
    if (this.coloursCounter === colours.length) {
      this.coloursCounter = 0;
    }
    person.colour = colours[this.coloursCounter];
    this.coloursCounter++;
    return person;
  }

  // returns a http request
  getData(url: string): Observable<Response> {
    return this.http.get(url);
  }

  // giving a url adds planet data to planets dictionary
  // uses api endpoint {id} as key. eg. api/planets/{id}/
  getPlanetData(url: String): void {
    const data = this.getData(url.toString());
    data.toPromise().then((res: Response) => {
      const planet = {...res.json()};
      const id = url.split('')[url.length - 2];
      this.planets[id] = planet;
    });
  }

  // Continue calling for data while: response.next (Url) != null.
  // add a take until to destroy subscription every time + on ngdestroy
  getPeopleData(url: String): void {
    this.getData(url.toString()).pipe(
      tap(data => {
        console.log('getPeopleData!');
        const res = data.json();
        res.results.map(person => this.addPerson(person));
        if (res.next != null) {
          this.getPeopleData(res.next);
        }
      }),
    ).subscribe();
  }

  ngOnInit() {
    this.getPeopleData(swapiUrl + 'people/');
  }

  ngOnDestroy() {

  }

}
