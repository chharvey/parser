import {TokenComment} from '../Token';



export class TokenCommentEbnf extends TokenComment {
	static readonly DELIM_START: '//' = '//';
	static readonly DELIM_END:   '\n' = '\n';
}
