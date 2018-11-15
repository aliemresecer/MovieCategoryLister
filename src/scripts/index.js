import '../styles/index.scss';
import { CategoryTableView } from './CategoryTableView'


function fetchCategories() {
    return fetch('https://www.whats-on-netflix.com/wp-json/wp/v2/pages/13613')
    .then(result => result.json())
    .then((data) => {
      const parser = new DOMParser();
      const htmlContent = parser.parseFromString(data.content.rendered,"text/html");
      const rowItems = htmlContent.evaluate("//table[@id='devices']/tbody//tr", htmlContent, null, XPathResult.ANY_TYPE, null);

      const jsonData = [];

      let rowItem = rowItems.iterateNext();
      while (rowItem) {
        const [ category, id ] = rowItem.querySelectorAll('td');
        rowItem = rowItems.iterateNext()
        jsonData.push({
          category: category.outerText,
          id: id.outerText
        });
      }

      return Promise.resolve(jsonData)
      
    });
}


async function init() {
    const categories = await fetchCategories();

    const table = new CategoryTableView({
        targetElementId: 'categoryContainer',
        pageSize: 15, 
        defaultPageIndex: 1
    });

    table.bind(categories);
    
    document.getElementById("filter").addEventListener("keyup", function({ currentTarget: { value } }){
        // apply filter if changed
        if (table.getFilter() != value)
            table.filter(value);
    });
     
     document.addEventListener("keydown", function(evt) {
         evt = evt || window.event;
         
         if (evt.target === document.getElementById("filter"))
            return;

         switch (evt.keyCode) {
             // arrow left
             case 37:
                table.prevPage();
                 break;
            // arrow right
             case 39:
                table.nextPage();
                 break;
         }
     });

}

init()