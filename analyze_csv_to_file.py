import pandas as pd
import sys

# Set output encoding
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Read the CSV file
df = pd.read_csv('ALL_CLEANED_MERGED.csv')

# Write to file
with open('analysis_report.txt', 'w', encoding='utf-8') as f:
    f.write("=" * 80 + "\n")
    f.write("CSV DATA ANALYSIS REPORT\n")
    f.write("=" * 80 + "\n")
    
    # Basic Information
    f.write("\n[DATASET OVERVIEW]\n")
    f.write("-" * 80 + "\n")
    f.write(f"Total Posts: {len(df):,}\n")
    f.write(f"Total Columns: {len(df.columns)}\n")
    f.write(f"Date Range: {df['posted_date_iso'].min()} to {df['posted_date_iso'].max()}\n")
    f.write(f"Unique Authors: {df['author_name'].nunique():,}\n")
    
    # Column Information
    f.write("\n[SCHEMA DETAILS]\n")
    f.write("-" * 80 + "\n")
    for col in df.columns:
        dtype = df[col].dtype
        non_null = df[col].count()
        null_count = df[col].isnull().sum()
        null_pct = (null_count / len(df)) * 100
        f.write(f"{col:25s} | {str(dtype):10s} | Non-Null: {non_null:6,} | Missing: {null_count:5,} ({null_pct:5.2f}%)\n")
    
    # Engagement Metrics
    f.write("\n[ENGAGEMENT STATISTICS]\n")
    f.write("-" * 80 + "\n")
    f.write(f"Average Likes:            {df['likes'].mean():>10.2f}\n")
    f.write(f"Median Likes:             {df['likes'].median():>10.2f}\n")
    f.write(f"Max Likes:                {df['likes'].max():>10,.0f}\n")
    f.write(f"\nAverage Comments:         {df['comments'].mean():>10.2f}\n")
    f.write(f"Median Comments:          {df['comments'].median():>10.2f}\n")
    f.write(f"Max Comments:             {df['comments'].max():>10,.0f}\n")
    f.write(f"\nAverage Reposts:          {df['reposts'].mean():>10.2f}\n")
    f.write(f"Median Reposts:           {df['reposts'].median():>10.2f}\n")
    f.write(f"Max Reposts:              {df['reposts'].max():>10,.0f}\n")
    f.write(f"\nAverage Engagement Score: {df['engagement_score'].mean():>10.2f}\n")
    f.write(f"Median Engagement Score:  {df['engagement_score'].median():>10.2f}\n")
    f.write(f"Max Engagement Score:     {df['engagement_score'].max():>10,.0f}\n")
    
    # Content Metrics
    f.write("\n[CONTENT STATISTICS]\n")
    f.write("-" * 80 + "\n")
    f.write(f"Average Word Count:       {df['word_count'].mean():>10.2f}\n")
    f.write(f"Median Word Count:        {df['word_count'].median():>10.2f}\n")
    f.write(f"Max Word Count:           {df['word_count'].max():>10,.0f}\n")
    f.write(f"Min Word Count:           {df['word_count'].min():>10,.0f}\n")
    f.write(f"\nPosts with Questions:     {df['has_question'].sum():>10,} ({(df['has_question'].sum()/len(df)*100):5.2f}%)\n")
    f.write(f"Posts with CTA:           {df['has_cta'].sum():>10,} ({(df['has_cta'].sum()/len(df)*100):5.2f}%)\n")
    f.write(f"Posts with Hashtags:      {(df['hashtags'].notna()).sum():>10,} ({((df['hashtags'].notna()).sum()/len(df)*100):5.2f}%)\n")
    
    # Post Types
    f.write("\n[POST TYPE DISTRIBUTION]\n")
    f.write("-" * 80 + "\n")
    post_types = df['post_type'].value_counts()
    for post_type, count in post_types.items():
        pct = (count / len(df)) * 100
        f.write(f"{post_type:20s}: {count:6,} ({pct:5.2f}%)\n")
    
    # Media Types
    f.write("\n[MEDIA TYPE DISTRIBUTION]\n")
    f.write("-" * 80 + "\n")
    media_types = df['media_type'].value_counts(dropna=False)
    for media_type, count in media_types.items():
        pct = (count / len(df)) * 100
        media_str = str(media_type) if pd.notna(media_type) else "None/Text Only"
        f.write(f"{media_str:20s}: {count:6,} ({pct:5.2f}%)\n")
    
    # Day of Week Distribution
    f.write("\n[POSTING SCHEDULE - DAY OF WEEK]\n")
    f.write("-" * 80 + "\n")
    day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    day_counts = df['posted_day_of_week'].value_counts()
    for day in day_order:
        if day in day_counts.index:
            count = day_counts[day]
            pct = (count / len(df)) * 100
            f.write(f"{day:15s}: {count:6,} ({pct:5.2f}%)\n")
    
    # Hour Distribution
    f.write("\n[POSTING SCHEDULE - HOUR OF DAY]\n")
    f.write("-" * 80 + "\n")
    hour_counts = df['posted_hour'].value_counts().sort_index()
    for hour, count in hour_counts.items():
        pct = (count / len(df)) * 100
        f.write(f"{hour:2d}:00 | {count:5,} ({pct:5.2f}%)\n")
    
    # Top Authors
    f.write("\n[TOP 10 AUTHORS BY POST COUNT]\n")
    f.write("-" * 80 + "\n")
    top_authors = df['author_name'].value_counts().head(10)
    for idx, (author, count) in enumerate(top_authors.items(), 1):
        f.write(f"{idx:2d}. {author:40s}: {count:4,} posts\n")
    
    # Engagement by Post Type
    f.write("\n[AVERAGE ENGAGEMENT BY POST TYPE]\n")
    f.write("-" * 80 + "\n")
    engagement_by_type = df.groupby('post_type').agg({
        'likes': 'mean',
        'comments': 'mean',
        'reposts': 'mean',
        'engagement_score': 'mean'
    }).round(2)
    f.write(engagement_by_type.to_string() + "\n")
    
    # Engagement by Media Type
    f.write("\n[AVERAGE ENGAGEMENT BY MEDIA TYPE]\n")
    f.write("-" * 80 + "\n")
    engagement_by_media = df.groupby('media_type').agg({
        'likes': 'mean',
        'comments': 'mean',
        'reposts': 'mean',
        'engagement_score': 'mean'
    }).round(2)
    f.write(engagement_by_media.to_string() + "\n")
    
    # Hashtag Analysis
    f.write("\n[HASHTAG INSIGHTS]\n")
    f.write("-" * 80 + "\n")
    posts_with_hashtags = df[df['hashtags'].notna()]
    if len(posts_with_hashtags) > 0:
        hashtag_counts = posts_with_hashtags['hashtags'].str.split(',').str.len()
        f.write(f"Average hashtags per post (when used): {hashtag_counts.mean():.2f}\n")
        f.write(f"Max hashtags in a single post:         {hashtag_counts.max()}\n")
    
    # Key Insights
    f.write("\n[KEY INSIGHTS]\n")
    f.write("-" * 80 + "\n")
    
    # Best performing day
    best_day = df.groupby('posted_day_of_week')['engagement_score'].mean().idxmax()
    f.write(f">> Best day to post: {best_day}\n")
    
    # Best performing hour
    best_hour = df.groupby('posted_hour')['engagement_score'].mean().idxmax()
    f.write(f">> Best hour to post: {best_hour}:00\n")
    
    # Posts with questions vs without
    if df['has_question'].sum() > 0:
        with_q = df[df['has_question'] == True]['engagement_score'].mean()
        without_q = df[df['has_question'] == False]['engagement_score'].mean()
        diff_pct = ((with_q - without_q) / without_q) * 100
        f.write(f">> Posts with questions get {diff_pct:+.2f}% more engagement\n")
    
    # Posts with CTA vs without
    if df['has_cta'].sum() > 0:
        with_cta = df[df['has_cta'] == True]['engagement_score'].mean()
        without_cta = df[df['has_cta'] == False]['engagement_score'].mean()
        diff_pct = ((with_cta - without_cta) / without_cta) * 100
        f.write(f">> Posts with CTA get {diff_pct:+.2f}% more engagement\n")
    
    # Optimal word count
    word_count_engagement = df.groupby(pd.cut(df['word_count'], bins=[0, 50, 100, 150, 200, 300, 500, 1000]))['engagement_score'].mean()
    best_range = word_count_engagement.idxmax()
    f.write(f">> Best word count range: {best_range}\n")
    
    f.write("\n" + "=" * 80 + "\n")
    f.write("END OF REPORT\n")
    f.write("=" * 80 + "\n")

print("Analysis complete! Report saved to analysis_report.txt")
