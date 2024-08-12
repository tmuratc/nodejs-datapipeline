require('dotenv').config();

dailyStats = `with is_users_first_event as ( 
  select t.event_time, t.session_id, t.user_id, 
        case 
          when t.user_id in ( select distinct drv.user_id 
                          from \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.${process.env.BQ_TABLE}\` drv 
                          where t.event_time > drv.event_time ) 
                          then 0 else 1 
        end as is_first_event
  from \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.${process.env.BQ_TABLE}\` t
),

-- since we want to see data in daily aggregation, first we take data into session breakdown. 
-- in session breakdown we used "max(is_first_event) over (partition by session_id)", because only -
-- first event row will have "1" value in event cte. This also allows us to make direct daily aggregation for new_user_count.

sessions_summary as (
select distinct
       date(event_time) as day, 
       session_id, 
       user_id,
       timestamp_diff(max(event_time) over (partition by session_id), 
                      min(event_time) over (partition by session_id), 
                      second) as duration,
       max(is_first_event) over (partition by session_id) as is_new_user
from is_users_first_event 
)

select day as date, 
       avg(duration) as average_session_duration, 
       count(distinct user_id) as active_user_count, 
       sum(is_new_user) as new_user_count
from sessions_summary
group by day order by day` 



totalUsers = `select count(distinct user_id) as total_users
              from \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.${process.env.BQ_TABLE}\``

module.exports = {dailyStats, totalUsers};