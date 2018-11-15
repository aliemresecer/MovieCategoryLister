export class HtmlComponent {
    
    props = null;
    elementType = null;
    
    constructor(props, elementType) {
        this.elementType = elementType;
        this.props = props;
    }

    render() {
        const { content } = this.props;

        return content;
    }


    after (element) {
        const { attributes } = this.props;

        if(attributes) {
            Object.keys(attributes).forEach(key => {
                element.setAttribute(key, attributes[key]);
            });
        }
        
    }

    static visitAll (elem, content) {
        if (content instanceof HtmlComponent) {
            const subElement = content.updateAndReturnElement();
            elem.appendChild(subElement);
        } else if (content instanceof Array) {
            content.forEach((subcontent) => { 
                HtmlComponent.visitAll(elem, subcontent);
            });
        } else if (typeof content === 'string') {
            elem.innerHTML = content;
        } else if (typeof content === 'object') {
            content && elem.appendChild(content);
        }
    }

    

    updateAndReturnElement(){
        const element = document.createElement(this.elementType);

        HtmlComponent.visitAll(element, this.render());
        this.after(element);
        
        return element;
    }
}