import asyncio
import config
import discord
import logging

channel_edit_reason = "DDC rename"
channel_delete_reason = "DDC empty channel delete"
channel_create_reason = "DDC no empty channel create"

new_channel_name = "New Channel"
new_channel_bitrate = 95999

async def on_voice_state_update(member, before, after):
    oldChannel = None
    if before.channel:
        await update_channel(before.channel)
        oldChannel = before.channel
    if after.channel and after.channel!=oldChannel:
        await update_channel(after.channel)


async def on_member_update(before, after):
    oldChannel = None
    if before.voice and before.voice.channel:
        await update_channel(before.voice.channel)
        oldChannel = before.voice.channel

    if after.voice and after.voice.channel and after.voice.channel!=oldChannel:
        await update_channel(after.voice.channel)


def is_present(member):
    if member.bot:
        return False
    if not member.voice:
        return False
    if member.voice.deaf:
        return False
    if member.voice.self_deaf:
        return False
    return True


def is_naming(member):
    if not is_present(member):
        return False
    if not member.activity:
        return False
    if (member.activity.type != discord.ActivityType.playing and 
            member.activity.type != discord.ActivityType.streaming):
        return False
    return True


async def is_managed_category(category):
    if not category:
        return False
    #TODO use DDB database for this
    if category.id == config.category_id:
        return True
    return False


async def ensure_category_has_new_channel(category):
    if not category or not await is_managed_category(category):
        return 

    new_channel_exists = False
    for channel in category.channels:
        if channel.name == new_channel_name and type(channel) == discord.VoiceChannel:
            new_channel_exists = True
            break
    
    if not new_channel_exists:
        await category.create_voice_channel(new_channel_name,
                                      bitrate=new_channel_bitrate,
                                      reason=channel_create_reason)


async def update_channel(channel):
    if not channel:
        return

    if not channel.category or not await is_managed_category(channel.category):
        return

    if len(channel.members)==0:
        await channel.delete()
    else:
        new_name = create_channel_name(channel)
        await channel.edit(name=new_name, reason=channel_edit_reason)
    
    if channel.category:
        await ensure_category_has_new_channel(channel.category)


def create_channel_name(channel):
    all_members = channel.members
    present_members = list(filter(is_present, all_members))
    naming_members = list(filter(is_naming, present_members))

    num_present_members = len(present_members)

    if num_present_members == 0:
        return "Nothing"

    activity_name_frequency = {}
    for m in naming_members:
        activity_name = m.activity.name
        if activity_name in activity_name_frequency:
            activity_name_frequency[activity_name] += 1
        else:
            activity_name_frequency[activity_name] = 1

    for activity_name in activity_name_frequency:
        if activity_name_frequency[activity_name] == num_present_members:
            return activity_name
        elif activity_name_frequency[activity_name] * 2 > num_present_members:
            return f"Mostly {activity_name}"
    
    return "Hanging Out"
