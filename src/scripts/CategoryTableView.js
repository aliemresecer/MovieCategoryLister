import { TableCellComponent, TableHeadComponent, TableFootComponent, TableBodyComponent, TableRowComponent, TableComponent } from './tableComponent';
import { HtmlComponent } from './htmlComponent';

const MAX_PAGE = 5;

export class PagerElement extends HtmlComponent {
    constructor(props) {
        super(props, 'a');
    }
	
	render() {
		const { label } = this.props;

        return label;
	}
	
	after(element) {
		super.after(element);
		
		const { id, active, onClick } = this.props;
		
		element.id = id;
        
        if (onClick)
            element.addEventListener('click', onClick);
        
        if (active) 
			element.className = 'active';
	}
}


export class SummaryComponent extends HtmlComponent {
    constructor(props) {
        super(props, 'div');
    }

    after(element){
        element.className = 'summary';
    }

}

export class PagerComponent extends HtmlComponent {
    constructor(props) {
        super(props, 'div');
    }

    createPagerItem(index, currentPage, onClick){
        const pagerIndex = parseInt(index);
        const pagerProps = {
			label: index.toString(),
			id: index,
			active: currentPage === index,
		}
		const pagerItem = new PagerElement(onClick ? {
            ...pagerProps,
            onClick: () => onClick(pagerIndex)
        } : pagerProps);
		
        return pagerItem;
    }

	createPagerElement(currentPage, label, direction, onClick) {
        const pagerProps = {
            label: label,
            id: label
        };

		const pagerElement = new PagerElement(onClick ? {
            ...pagerProps,
            onClick: () => onClick(currentPage + direction)
        } : pagerProps);
		
		return pagerElement;
	}
	

	getInitialPage() {
		const { pageLength, page } = this.props;
		const lessPage = pageLength > MAX_PAGE;
		
		if (lessPage){
            if(page >= 3 && pageLength - page > 2){
                return page-2
            }  else if(pageLength - page <= MAX_PAGE){
                return pageLength -4
            } else {
                return 1
            }
        }
			
		return 1
	}

    render() {
        const {pageLength, page, onClick } = this.props;
        const pages = [...Array(pageLength > MAX_PAGE ? MAX_PAGE : pageLength)];
        const lessPage = pageLength > MAX_PAGE;
        const initialPage = this.getInitialPage();

        const currentPager = pages.map((item, currentIndex) => {
            return this.createPagerItem(initialPage + currentIndex, page, onClick);
        });
        
		const prev = this.createPagerElement(page, 'Prev', -1, onClick);
        lessPage && page > 1 && currentPager.unshift(prev)
        
		const next = this.createPagerElement(page, 'Next', 1, onClick)
        lessPage && page < pageLength && currentPager.push(next)

        return pageLength ? currentPager : 'No Results';
    }
}

export class CategoryTableView {
    targetElementId = null;
    pageSize = null;
    defaultPageIndex = null;
    data = null;
    filteredData = null;

    /**
     * 
     * @param { targetElementId: 'string', pageSize: int, defaultPageIndex: int  } settings 
     */
    constructor({
        targetElementId,
        pageSize, 
        defaultPageIndex
    }) { 
        this.targetElementId = targetElementId;
        this.pageSize = pageSize; 
        this.defaultPageIndex = defaultPageIndex;

    }

    setPageSize(newPageSize) {
        this.pageSize = newPageSize;
        this.setPageIndex(this.defaultPageIndex);
    }

    setPageIndex(newPageIndex) {
        this.pageIndex = newPageIndex;
        this.renderPaged(this.getData());
    }

    bind(newData) {
        this.data = newData;
        this.setPageIndex(this.defaultPageIndex);
        this.filteredData = null;
        this.keyword = null;
    }

    renderPaged(items){
        const currentPage = items.slice((this.pageIndex * this.pageSize - this.pageSize), this.pageIndex * this.pageSize)
        this.pageLength = Math.ceil(items.length / this.pageSize);
        this.render(currentPage);
    }

    getData() {
        return this.filteredData && this.keyword ? this.filteredData : this.data;
    }

    getFilter() {
        return this.keyword;
    }

    filter(keyword) {
        this.keyword = keyword;
        const filtered = this.data.filter(item => item.category.toLowerCase().indexOf(keyword.toLowerCase()) > -1);
        this.pageIndex = this.defaultPageIndex;
        this.filteredData = filtered;
        this.renderPaged(filtered);
        
        return filtered
    }

    prevPage() {
        if (this.pageIndex == 1)
            return false;

        this.setPageIndex(this.pageIndex - 1);
        return true;
    }

    nextPage() {
        if (this.pageIndex == this.pageLength)
            return false;

        this.setPageIndex(this.pageIndex + 1);
        return true;
    }

    buildHeader() {
        const header = [
            new TableHeadComponent({
                content: new TableRowComponent({
                    content: [
                        new TableCellComponent({
                            header: true,
                            content: 'Category Name'
                        }),
                        new TableCellComponent({
                            header: true,
                            content: 'Category ID'
                        })
                    ]
                })
            })
        ];
        return header;
    }
  
    buildBody(rowData) {
        const items = rowData || [];
        const body = new TableBodyComponent({
            content: items.map((item) => { 
                const categoryCell = new TableCellComponent({
                    target: '_blank',
                    href: `http://www.netflix.com/browse/genre/${item.id}`,
                    content: item.category
                });

                const valueCell = new TableCellComponent({
                    content: item.id
                });

                return new TableRowComponent({
                    content: [categoryCell, valueCell]
                });
            })
        });
        
        return body;
    }
  
    buildFooter(){
        const totalRecords = this.getData().length

        const summary = totalRecords > 0 ? new SummaryComponent({
            content: `Total <b>${totalRecords}</b> records.`
        }) : null;

        const foot = [
            new TableFootComponent({
                content: new TableRowComponent({
                    content: [
                        new TableCellComponent({
                            colspan: 2,
                            content: [new PagerComponent({
                                pageSize: this.pageSize,
                                pageLength: this.pageLength,
                                page: this.pageIndex,
                                onClick:(pageIndex) => {
                                    this.setPageIndex(pageIndex);
                                }
                            }), 
                        summary]
                        })
                    ]
                })
            })
        ];

        return foot;
    }
  
    render(items){
        const table = new TableComponent({
            content:[
                this.buildHeader(),
                this.buildBody(items),
                this.buildFooter()
            ]
        });

        this.renderInTarget(table);
    }

    renderInTarget(component) {
        if (component == null)
            return false;

        const tableElement = component.updateAndReturnElement();
        const targetElement = document.getElementById(this.targetElementId);
        targetElement.innerHTML = '';
        targetElement.appendChild(tableElement);

        return true;
    }
}