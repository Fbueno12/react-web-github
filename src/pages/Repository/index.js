import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../componets/Container';

import { Loading, Owner, IssueList } from './styles';

export default class Repository extends Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                repository: PropTypes.string,
            }),
        }).isRequired,
    };

    state = {
        repository: {},
        issues: [],
        status: 'open',
        loading: true,
        page: 1,
    };

    async componentDidMount() {
        const { match } = this.props;
        const { status, page } = this.state;

        const repoName = decodeURIComponent(match.params.repository);

        const [repository, issues] = await Promise.all([
            api.get(`/repos/${repoName}`),
            api.get(`/repos/${repoName}/issues`, {
                params: {
                    state: status,
                    page,
                    per_page: 5,
                },
            }),
        ]);

        this.setState({
            repository: repository.data,
            issues: issues.data,
            loading: false,
        });
    }

    componentDidUpdate() {
        this.componentDidMount();
    }

    changeState(state) {
        this.setState({
            status: state,
        });
    }

    changePage(modifier) {
        let { page } = this.state;
        if (modifier === 'next') {
            page += 1;
        } else {
            page -= 1;
        }
        this.setState({
            page,
        });
    }

    render() {
        const { repository, issues, loading, status, page } = this.state;

        if (loading) {
            return <Loading>Carregando</Loading>;
        }

        return (
            <Container>
                <Owner>
                    <Link to="/">Voltar aos repositórios</Link>
                    <img
                        src={repository.owner.avatar_url}
                        alt={repository.owner.login}
                    />
                    <h1>{repository.name}</h1>
                    <p>{repository.description}</p>
                    <nav>
                        <button
                            type="button"
                            onClick={() => this.changeState('all')}
                            className={status === 'all' && 'clicked'}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            onClick={() => this.changeState('open')}
                            className={status === 'open' && 'clicked'}
                        >
                            Open
                        </button>
                        <button
                            type="button"
                            onClick={() => this.changeState('closed')}
                            className={status === 'closed' && 'clicked'}
                        >
                            Closed
                        </button>
                    </nav>
                </Owner>
                <IssueList>
                    {issues.map(issue => (
                        <li key={String(issue.id)}>
                            <img
                                src={issue.user.avatar_url}
                                alt={issue.user.login}
                            />
                            <div>
                                <strong>
                                    <a href={issue.html_url}>{issue.title}</a>
                                    {issue.labels.map(label => (
                                        <span key={String(label.id)}>
                                            {label.name}
                                        </span>
                                    ))}
                                </strong>
                                <p>{issue.user.login}</p>
                            </div>
                        </li>
                    ))}
                    <nav>
                        <button
                            type="button"
                            onClick={() => this.changePage('back')}
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            onClick={() => this.changePage('next')}
                        >
                            Next
                        </button>
                    </nav>
                </IssueList>
            </Container>
        );
    }
}
