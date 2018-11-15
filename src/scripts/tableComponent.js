import { HtmlComponent } from './htmlComponent';

export class TableComponent extends HtmlComponent {
    constructor(props) {
        super(props, 'table');
    }
}


export class TableHeadComponent extends HtmlComponent {
    constructor(props) {
        super(props, 'thead');
    }
}

export class TableBodyComponent extends HtmlComponent {
    constructor(props) {
        super(props, 'tbody');
    }
}

export class TableFootComponent extends HtmlComponent {
    constructor(props) {
        super(props, 'tfoot');
    }
}

export class TableRowComponent extends HtmlComponent {
    constructor(props) {
        super(props, 'tr');
    }
}

export class TableCellComponent extends HtmlComponent {
    constructor(props) {
        const {
            ['header']: header,
            ['colspan']: colspan,
            ...superProps
        } = props;

        const attributes = colspan ? {
            ...superProps.attributes,
            colspan: colspan
        } : superProps.attributes;

        const tagName = header ? 'th' : 'td';

        super({
            ...superProps,
            attributes
        }, tagName);
    }

    render() {
        const { href, target, content } = this.props;

        if (!href)
            return content;

        const targetAttr = target != null ? 'target="blank"' : '';

        return `<a ${targetAttr} href="${href}">${content}</a>`;
    }
}
