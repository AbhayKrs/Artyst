import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import { fetchArtworkImages, fetchUserImages } from '../api';
import { fetchArtworkList, fetchArtwork, handleLikeArtwork, handleAwardArtwork, handleDislikeArtwork, handleAddComment, handleEditComment, handleDeleteComment, handleLikeComment, handleDislikeComment } from '../store/actions/explore.actions';
import { fetchAwards, setError } from '../store/actions/common.actions';
import { ExploreShowCarousel } from '../components/Carousel';
import { AwardModal } from '../components/Modal';

import { IoEye, IoHeart, IoSend, IoShareSocialSharp, IoChatbox } from 'react-icons/io5';
import { BsFillBookmarkFill, BsTrash, BsHeartFill, BsPlusLg } from 'react-icons/bs';
import { IoIosSend } from "react-icons/io";
import { AiFillLike, AiFillDislike } from 'react-icons/ai';
import { FcLikePlaceholder, FcLike } from "react-icons/fc";
import { MdEdit, MdEditOff } from 'react-icons/md';
import { ImPlus } from 'react-icons/im';

import AwardIcon from '../assets/images/gift.png';
import Explore from './Explore';

const ExploreShow = (props) => {
    const [prev, setPrev] = useState('');
    const [next, setNext] = useState('');
    const [like, setLike] = useState(false);
    const [comment, setComment] = useState('');
    const [editForm, setEditForm] = useState(false);
    const [editIndex, setEditIndex] = useState('');
    const [editComment, setEditComment] = useState('');
    const [awardOpen, setAwardOpen] = useState(false);

    const { id } = useParams();
    let navigate = useNavigate();

    useEffect(async () => {
        await props.fetchArtworkList();
        props.fetchArtwork(id);
        props.fetchAwards();
    }, [])

    const submitComment = async (event) => {
        event.preventDefault();
        await props.handleAddComment(comment, id);
        props.fetchArtwork(id);
        setComment('');
    }

    useEffect(() => {
        const len = props.explore.artworkList.length;
        props.fetchArtwork(id);
        if (props.exploreShow.likes.filter(item => item === props.user.id).length > 0) {
            setLike(true);
        } else {
            setLike(false);
        }
        props.explore.artworkList.forEach((item, index) => {
            if (item._id === props.exploreShow._id) {
                if (index > 0) {
                    setPrev(props.explore.artworkList[index - 1]._id)
                } else {
                    setPrev('');
                }
                if (index < len - 1) {
                    setNext(props.explore.artworkList[index + 1]._id)
                } else {
                    setNext('')
                }
            }
        })
    }, [props.exploreShow._id]);

    const handleToggleLike = async (likes) => {
        if (likes.includes(props.user.id)) {
            await props.handleDislikeArtwork(id, false);
        } else {
            await props.handleLikeArtwork(id, true);
        }
        props.fetchArtwork(id);
    }

    const handleAwardArtwork = async (award) => {
        console.log('handleAwardArtwork', award);
        await props.handleAwardArtwork(id, award);
        setTimeout(() => {
            props.fetchArtwork(id);
        }, 2000);
    }

    const onDeleteComment = async (comment) => {
        await props.handleDeleteComment(id, comment._id);
        props.fetchArtwork(id);
    }

    const onEditComment = async (comment) => {
        await props.handleEditComment(editComment, id, comment._id);
        setEditForm(false);
        setTimeout(() => {
            props.fetchArtwork(id);
        }, 2000);
        return false;
    }

    const handleToggleCommentLike = async (status, comment) => {
        if (!status) {
            await props.handleDislikeComment(id, comment._id);
        } else {
            await props.handleLikeComment(id, comment._id);
        }
        setTimeout(() => {
            props.fetchArtwork(id);
        }, 2000);
    }

    const slider = document.querySelector('#award');
    let mouseDown = false;
    let startX, scrollLeft;

    if (slider) {
        let startDragging = function (e) {
            mouseDown = true;
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        };
        let stopDragging = function (event) {
            mouseDown = false;
        };

        slider.addEventListener('mousemove', (e) => {
            e.preventDefault();
            if (!mouseDown) { return; }
            const x = e.pageX - slider.offsetLeft;
            const scroll = x - startX;
            slider.scrollLeft = scrollLeft - scroll;
        });

        slider.addEventListener('mousedown', startDragging, false);
        slider.addEventListener('mouseup', stopDragging, false);
        slider.addEventListener('mouseleave', stopDragging, false);
    }

    const handleInvalidUser = () => {
        const error = {
            open: true,
            message: 'User not logged in. Please Sign In/Sign Up to perform the action.',
            type: 'snackbar'
        }
        console.log('like error', error)
        props.setError(error);
    }

    return (
        <div className='grid gap-2 bg-gray-200 dark:bg-darkNavBg sm:grid-cols-1 lg:grid-cols-12'>
            <ExploreShowCarousel
                prevTrue={prev.length > 0}
                nextTrue={next.length > 0}
                data={props.explore.artworkList}
                currentImage={props.exploreShow.files[0]}
                secondaryImages={props.exploreShow.files.filter((image, index) => index !== 0)}
                prev={() => { navigate(`/explore/${prev}`); props.fetchArtwork(prev); }}
                next={() => { navigate(`/explore/${next}`); props.fetchArtwork(next); }}
            />
            <div className='lg:col-span-5 md:mt-3 sm:mt-0'>
                <div className='flex flex-col rounded-md bg-neutral-50 dark:bg-neutral-800 mx-2 p-3'>
                    <div className='flex'>
                        <div className='basis-9/12 space-y-2'>
                            <h1 className='font-caviar text-3xl tex-gray-900 dark:text-gray-300 font-bold'>{props.exploreShow.title}</h1>
                            <p className='font-josefinlight text-lg tex-gray-800 dark:text-gray-400'>{props.exploreShow.description}</p>
                            <div className='flex flex-wrap'>
                                {props.exploreShow.tags.map(item => (
                                    <div className="flex w-fit justify-center items-center m-1 font-medium py-1 px-2 bg-neutral-700 dark:bg-gray-300 rounded-full text-gray-200 dark:text-gray-900 border border-gray-300 " >
                                        <div className="text-xs font-medium leading-none">{item}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='basis-3/12'>
                            <div className='flex justify-end items-center space-x-3'>
                                <div className="relative float-left flex">
                                    <img onClick={props.common.isAuthenticated ? () => setAwardOpen(true) : handleInvalidUser} src={AwardIcon} className='h-12 w-12 cursor-pointer' />
                                    <ImPlus className="absolute bottom-0 right-0 text-[#D1853A] h-4 w-4" />
                                </div>
                                <BsHeartFill style={like ? { color: '#FF3980' } : { color: '#F190B3' }} className='h-6 w-6 cursor-pointer' onClick={props.common.isAuthenticated ? () => { setLike(!like); handleToggleLike(props.exploreShow.likes) } : handleInvalidUser} />
                                <IoShareSocialSharp className='h-6 w-6 text-violet-500 dark:text-violet-400' />
                                <BsFillBookmarkFill onClick={props.common.isAuthenticated ? () => console.log('bookmark!') : handleInvalidUser} className='h-6 w-6 text-violet-500 dark:text-violet-400' />
                            </div>
                            <div className='flex justify-end py-0.5 space-x-2 text-teal-500'>
                                <h3 className='font-josefinlight text-lg'>{new Intl.NumberFormat().format(props.exploreShow.likes.length) + ' views'}</h3>
                                <IoEye className='h-6 w-6' />
                            </div>
                            <div className='flex justify-end py-0.5 space-x-2 text-violet-500 dark:text-violet-400'>
                                <h3 className='font-josefinlight text-lg'>{new Intl.NumberFormat().format(props.exploreShow.likes.length) + ' likes'}</h3>
                                <IoHeart className='h-6 w-6' />
                            </div>
                            <div className='flex justify-end py-0.5 space-x-2 text-violet-500 dark:text-violet-400'>
                                <h3 className='font-josefinlight text-lg'>{new Intl.NumberFormat().format(props.exploreShow.comment_count) + ' comments'}</h3>
                                <IoChatbox className='h-6 w-6' />
                            </div>
                            <div className='flex flex-col text-right justify-end py-1 text-neutral-900 dark:text-gray-400'>
                                <p className='font-josefinlight text-xl'>Posted By</p>
                                <div className="flex justify-end">
                                    <div className="w-6 h-6 overflow-hidden">
                                        <img src={fetchUserImages(props.exploreShow.author.avatar.icon)} alt="user_avatar" className="object-cover w-full h-full" />
                                    </div>
                                    <p className="font-josefinlight pt-0.5 font-medium text-lg mx-0.5">
                                        {props.exploreShow.author.username}
                                    </p>
                                    <svg className="stroke-current stroke-1 text-blue-600 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <p className='font-josefinlight whitespace-nowrap text-sm'>{moment(props.exploreShow.createdAt).format('MMMM Do YYYY, h:mm:ss a')}</p>
                            </div>
                        </div>
                    </div>
                    <div id='award' className='flex overflow-x-hidden bg-slate-200 dark:bg-neutral-700 p-2 rounded-lg space-x-2'>
                        {props.common.awardList.map(award => (
                            <div className="relative float-left mr-2 flex">
                                <img draggable="false" className='max-w-fit h-12 w-12' src={fetchUserImages(award.icon)} />
                                <span className="absolute font-bold top-0 right-0 inline-block rounded-full bg-violet-800 shadow-lg shadow-neutral-800 text-gray-300 px-1.5 py-0.5 text-xs">{0/*award.count*/}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {props.common.isAuthenticated ?
                    <div className='m-2 rounded flex bg-violet-900'>
                        {comment.length > 0 ?
                            <IoIosSend onClick={(ev) => submitComment(ev)} className='h-7 w-7 text-gray-200 cursor-pointer self-center ml-2' />
                            :
                            <IoIosSend className='h-7 w-7 text-gray-300 self-center ml-2' />
                        }
                        <input type="text" name="comment" value={comment} onChange={(ev) => setComment(ev.target.value)} onKeyPress={(ev) => { if (ev.key === 'Enter') { submitComment(ev) } }} placeholder={`Hey ${props.user.username}, Let the artist know your thoughts...`} className="font-josefinlight w-full mx-2 my-3 font-bold text-md placeholder:text-gray-300 text-gray-200 outline-none bg-violet-900 border-b-2 border-b-gray-300" />
                    </div>
                    :
                    ''}
                <div className='m-2 ml-6'>
                    {props.exploreShow.comments.map((comment, index) => (
                        <div className='flex rounded-lg items-center bg-violet-900 text-gray-300 py-2 px-4 mb-2 space-x-2'>
                            <div className='flex flex-col basis-10/12'>
                                {editForm && index === editIndex ?
                                    <div className='rounded flex bg-violet-900'>
                                        <input type="text" name="comment" value={editComment} onChange={(ev) => setEditComment(ev.target.value)} onKeyPress={(ev) => { if (ev.key === 'Enter') { ev.preventDefault(); onEditComment(comment) } }} className="font-josefinlight w-fit mb-2 font-bold text-md placeholder:text-gray-300 text-gray-200 outline-none bg-violet-900 border-b-2 border-b-gray-300" />
                                        <IoSend onClick={(ev) => onEditComment(comment)} className='h-5 w-5 ml-2 text-gray-200 cursor-pointer self-center' />
                                    </div>
                                    :
                                    <p className='font-josefinlight text-lg font-bold'>{comment.content}</p>
                                }
                                <div className='flex'>
                                    <div className="w-4 h-4 overflow-hidden">
                                        <img src={fetchUserImages(comment.author.avatar.icon)} alt="user_avatar" className="object-cover w-full h-full" />
                                    </div>
                                    <p className="font-josefinlight text-sm mx-0.5">
                                        {comment.author.username}
                                    </p>
                                    <p className='font-josefinlight text-sm'>{'- ' + moment(comment.createdAt).fromNow()}</p>
                                </div>
                            </div>
                            <div className="flex basis-2/12 items-center justify-end relative ">
                                <div className='flex space-x-1'>
                                    {comment.likes.filter(item => item === props.user.id).length > 0 ?
                                        <button onClick={() => console.log('already liked!')}>
                                            <AiFillLike className='w-5 h-5' />
                                        </button>
                                        :
                                        <button onClick={props.common.isAuthenticated ? () => handleToggleCommentLike(true, comment) : handleInvalidUser}>
                                            <AiFillLike className='w-5 h-5 text-gray-900' />
                                        </button>
                                    }
                                    <div className="text-sm">
                                        {comment.likes.length}
                                    </div>
                                    <button onClick={props.common.isAuthenticated ? () => handleToggleCommentLike(false, comment) : handleInvalidUser}>
                                        <AiFillDislike className='w-5 h-5' />
                                    </button>
                                </div>
                                {props.common.isAuthenticated && props.user.id === comment.author.id ?
                                    <div className='flex flex-col ml-2 border-l-2 border-gray-300 pl-3 space-y-2'>
                                        {editForm && index === editIndex ?
                                            <MdEditOff onClick={() => { setEditForm(false) }} className='w-5 h-5' />
                                            :
                                            <MdEdit onClick={() => { setEditComment(comment.content); setEditForm(true); setEditIndex(index) }} className='w-5 h-5' />
                                        }
                                        <BsTrash onClick={() => onDeleteComment(comment)} className='w-5 h-5 cursor-pointer' />
                                    </div>
                                    :
                                    ''}
                            </div>
                        </div>
                    ))}
                </div>
                <AwardModal
                    open={awardOpen}
                    title='Awards'
                    awardList={props.common.awardList}
                    onClose={() => setAwardOpen(false)}
                    onClick={() => setAwardOpen(false)}
                    handleAwardArtwork={handleAwardArtwork}
                />
            </div>
        </div >
    )
}

const StoreShow = (props) => {
    return (
        <div>test store show</div>
    )
}

const mapStateToProps = (state, props) => ({
    user: state.common.user,
    common: state.common,
    explore: state.explore,
    exploreShow: state.explore.artworkData
})

const mapDispatchToProps = (dispatch) => bindActionCreators({
    fetchArtwork,
    fetchArtworkList,
    handleLikeArtwork,
    handleAwardArtwork,
    handleDislikeArtwork,
    handleAddComment,
    handleEditComment,
    handleDeleteComment,
    handleLikeComment,
    handleDislikeComment,
    fetchAwards,
    setError
}, dispatch);

export default {
    ExploreShow: connect(mapStateToProps, mapDispatchToProps)(ExploreShow),
    StoreShow: connect(mapStateToProps, mapDispatchToProps)(StoreShow)
}